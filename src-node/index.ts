// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
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
  directory: string
  needle: string | RegExp
  excludePaths?: string[]
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

  if (options.excludePaths) {
    if (!Array.isArray(options.excludePaths)) {
      throw new TypeError('Invalid input: options.excludePaths must be an array')
    }

    if (options.excludePaths.some(path => typeof path !== 'string' || path.length === 0)) {
      throw new TypeError('Invalid input: options.excludePaths must be an array of strings')
    }
  }

  options.needle = typeof options.needle === 'string' ? options.needle : options.needle.source

  return binding.exportedFn(options)
}

export { fastFindInFiles }
