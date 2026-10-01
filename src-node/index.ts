import fs from 'fs'
import path from 'path'
import loadBinding from 'node-gyp-build'

export interface QueryHit {
  /**
   * `<filePath>:<lineNumber>:<column>`, with a 1-based column, ready to open in an editor.
   */
  link: string
  /**
   * The full line the hit is on, without its line ending.
   */
  line: string
  /**
   * 1-based line number.
   */
  lineNumber: number
  /**
   * 0-based index of the hit in `line`, in JS string units, so `line.slice(offset)` starts at the hit.
   */
  offset: number
}

export interface FastFindInFiles {
  filePath: string
  totalHits: number
  queryHits: QueryHit[]
}

export interface FastFindInFilesOptions {
  /**
   * Absolute or relative directory path to search in.
   */
  directory: string
  /**
   * A string is matched as exact text. A RegExp is matched line by line with JavaScript's own engine, so every flag and
   * syntax feature behaves as it does in `String.prototype.matchAll`.
   */
  needle: string | RegExp
  /**
   * Folders to skip. A string is a folder path, either as it appears in `filePath` (prefixed with `directory`) or
   * relative to `directory`. A RegExp is tested against the folder's full path, the way `RegExp.test` would; the `i`
   * flag is honored, and lookbehind, named groups, and Unicode features are not available here.
   */
  excludeFolderPaths?: (string | RegExp)[]
  /**
   * Search files and folders whose names start with a dot, such as `.github` or `.env`. Defaults to false.
   */
  includeHidden?: boolean
}

interface NativeWalkOptions {
  directory: string
  includeHidden: boolean
  excludePaths: string[]
  excludePatterns: { source: string; ignoreCase: boolean }[]
}

interface NativeTextOptions extends NativeWalkOptions {
  needle: string
}

interface NativeBinding {
  listFiles(options: NativeWalkOptions): string[]
  listFilesAsync(options: NativeWalkOptions): Promise<string[]>
  searchText(options: NativeTextOptions): FastFindInFiles[]
  searchTextAsync(options: NativeTextOptions): Promise<FastFindInFiles[]>
}

type Plan =
  | { kind: 'text'; options: NativeTextOptions }
  | { kind: 'regex'; options: NativeWalkOptions; regex: RegExp; prefilter: RegExp | undefined }

const binding = loadBinding(path.join(__dirname, '..')) as NativeBinding

// Same heuristic as git and the native side: a NUL byte near the start of a file marks it as binary.
const BINARY_SNIFF_BYTES = 8000
const READ_CONCURRENCY = 32
const REGEX_SYNTAX = /[\\^$.*+?()[\]{}|]/
// Exclude patterns run in the native ECMAScript engine, which lacks these.
const UNSUPPORTED_EXCLUDE_SYNTAX: [RegExp, string][] = [
  [/\(\?<[=!]/, 'lookbehind assertions'],
  [/\(\?<[A-Za-z_$]|\\k</, 'named capture groups'],
  [/\\[pP]\{/, 'Unicode property escapes'],
]

function toExcludePattern(regex: RegExp): NativeWalkOptions['excludePatterns'][number] {
  for (const flag of regex.flags) {
    if (!'gimsd'.includes(flag)) {
      throw new TypeError(`Invalid input: options.excludeFolderPaths uses the unsupported RegExp flag "${flag}"`)
    }
  }
  for (const [syntax, name] of UNSUPPORTED_EXCLUDE_SYNTAX) {
    if (syntax.test(regex.source)) {
      throw new TypeError(`Invalid input: options.excludeFolderPaths uses ${name}, which are not supported`)
    }
  }
  return { source: regex.source, ignoreCase: regex.ignoreCase }
}

// Copies `regex` without g and y (lastIndex state has no place here), plus the one `flag` asked for.
function withFlag(regex: RegExp, flag: string): RegExp {
  const flags = regex.flags.replace(/[gy]/g, '')
  return new RegExp(regex.source, flags.includes(flag) ? flags : flags + flag)
}

function toPlan(options: FastFindInFilesOptions): Plan {
  if (!options || typeof options !== 'object') {
    throw new TypeError('Invalid input: Missing options')
  }

  const { directory, needle, excludeFolderPaths = [], includeHidden = false } = options

  if (typeof directory !== 'string' || directory.length === 0) {
    throw new TypeError('Invalid input: Invalid or missing options.directory')
  }

  if (typeof includeHidden !== 'boolean') {
    throw new TypeError('Invalid input: options.includeHidden must be a boolean')
  }

  if (!Array.isArray(excludeFolderPaths)) {
    throw new TypeError('Invalid input: options.excludeFolderPaths must be an array')
  }

  const walk: NativeWalkOptions = { directory, includeHidden, excludePaths: [], excludePatterns: [] }
  for (const excludeFolderPath of excludeFolderPaths) {
    if (excludeFolderPath instanceof RegExp) {
      walk.excludePatterns.push(toExcludePattern(excludeFolderPath))
      continue
    }

    const normalized = typeof excludeFolderPath === 'string' ? excludeFolderPath.replace(/\/+$/, '') : ''
    if (normalized.length === 0) {
      throw new TypeError('Invalid input: options.excludeFolderPaths entries must be nonempty strings or RegExps')
    }
    walk.excludePaths.push(normalized)
  }

  if (typeof needle === 'string' && needle.length > 0) {
    if (/[\r\n]/.test(needle)) {
      throw new TypeError('Invalid input: options.needle must not contain line breaks')
    }
    return { kind: 'text', options: { ...walk, needle } }
  }

  if (needle instanceof RegExp) {
    // A pattern with no special characters is plain text, which the native side matches fastest.
    if (!needle.ignoreCase && !REGEX_SYNTAX.test(needle.source)) {
      return { kind: 'text', options: { ...walk, needle: needle.source } }
    }

    // Whole-file test with `m`, so ^ and $ still mean line boundaries, rules out most files before splitting lines.
    // Every per-line match is also a whole-file match, except through negative lookarounds that can see a newline.
    const prefilter = /\(\?<?!/.test(needle.source) ? undefined : withFlag(needle, 'm')
    return { kind: 'regex', options: walk, regex: withFlag(needle, 'g'), prefilter }
  }

  throw new TypeError('Invalid input: Invalid or missing options.needle')
}

function matchFile(filePath: string, buffer: Buffer, regex: RegExp, prefilter: RegExp | undefined) {
  if (buffer.subarray(0, BINARY_SNIFF_BYTES).includes(0)) return undefined

  const content = buffer.toString('utf8')
  if (prefilter && !prefilter.test(content)) return undefined

  const queryHits: QueryHit[] = []
  const lines = content.split('\n')
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index].endsWith('\r') ? lines[index].slice(0, -1) : lines[index]
    for (const match of line.matchAll(regex)) {
      // Zero-length matches (`x*` on a line without x) carry no text and are skipped.
      if (match[0].length === 0) continue
      const offset = match.index ?? 0
      queryHits.push({ link: `${filePath}:${index + 1}:${offset + 1}`, line, lineNumber: index + 1, offset })
    }
  }

  return queryHits.length > 0 ? { filePath, totalHits: queryHits.length, queryHits } : undefined
}

/**
 * Recursively searches `directory` for `needle`, blocking until done. Throws if `directory` cannot be read or an
 * exclude pattern is invalid; unreadable files and folders below it are skipped. Results are sorted by path.
 */
function fastFindInFiles(options: FastFindInFilesOptions): FastFindInFiles[] {
  const plan = toPlan(options)
  if (plan.kind === 'text') return binding.searchText(plan.options)

  const results: FastFindInFiles[] = []
  for (const filePath of binding.listFiles(plan.options)) {
    let buffer: Buffer
    try {
      buffer = fs.readFileSync(filePath)
    } catch {
      // SAFETY: a file that vanished or became unreadable after the walk is skipped, as the native walk does.
      continue
    }
    const result = matchFile(filePath, buffer, plan.regex, plan.prefilter)
    if (result) results.push(result)
  }
  return results
}

/**
 * Same as `fastFindInFiles`, without blocking: folder walking and text search run on a worker thread, and files are
 * read asynchronously. Rejects instead of throwing.
 */
async function fastFindInFilesAsync(options: FastFindInFilesOptions): Promise<FastFindInFiles[]> {
  const plan = toPlan(options)
  if (plan.kind === 'text') return binding.searchTextAsync(plan.options)

  const { regex, prefilter } = plan
  const files = await binding.listFilesAsync(plan.options)
  const results: (FastFindInFiles | undefined)[] = new Array(files.length)
  let next = 0
  const reader = async () => {
    while (next < files.length) {
      const index = next++
      let buffer: Buffer
      try {
        buffer = await fs.promises.readFile(files[index])
      } catch {
        // SAFETY: a file that vanished or became unreadable after the walk is skipped, as the native walk does.
        continue
      }
      results[index] = matchFile(files[index], buffer, regex, prefilter)
    }
  }
  await Promise.all(Array.from({ length: Math.min(READ_CONCURRENCY, files.length) }, reader))
  return results.filter((result): result is FastFindInFiles => result !== undefined)
}

export { fastFindInFiles, fastFindInFilesAsync }
