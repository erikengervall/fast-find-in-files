// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import binding from '../build/Release/binding.node'

export interface QueryHit {
  link: string
  line: string
  lineNumber: number
  offset: number
}

export interface FastFindInFiles {
  filePath: string
  totalHits: number
  queryHits: QueryHit[]
}

interface FastFindInFilesOptions {
  /**
   * Absolute or relative directory path to search in.
   */
  directory: string
  /**
   * String or RegExp to search for.
   */
  needle: string | RegExp
  /**
   * Relative folder paths or RegExp paths to exclude from the search.
   */
  excludeFolderPaths?: (string | RegExp)[]
}

function fastFindInFiles(options: FastFindInFilesOptions): FastFindInFiles[] {
  if (!options) {
    throw new TypeError('Invalid input: Missing options')
  }

  if (typeof options.directory !== 'string' || options.directory.length === 0) {
    throw new TypeError('Invalid input: Invalid or missing options.directory')
  }

  if ((typeof options.needle !== 'string' || options.needle.length === 0) && !(options.needle instanceof RegExp)) {
    throw new TypeError('Invalid input: Invalid or missing options.needle')
  }

  if (options.excludeFolderPaths) {
    if (!Array.isArray(options.excludeFolderPaths)) {
      throw new TypeError('Invalid input: options.excludeFolderPaths must be an array')
    }

    options.excludeFolderPaths = options.excludeFolderPaths.map((excludeFolderPath) => {
      if (excludeFolderPath instanceof RegExp) {
        return excludeFolderPath.source
      }

      if (typeof excludeFolderPath !== 'string' || excludeFolderPath.length === 0) {
        throw new TypeError('Invalid input: options.excludeFolderPaths.excludeFolderPath must be nonempty string')
      }

      if (excludeFolderPath.endsWith('/')) {
        throw new TypeError('Invalid input: options.excludeFolderPaths.excludeFolderPath must not end with "/"')
      }

      return `^${excludeFolderPath}$`
    })
  }

  options.needle = typeof options.needle === 'string' ? options.needle : options.needle.source

  return binding.exportedFn(options)
}

export { fastFindInFiles }
