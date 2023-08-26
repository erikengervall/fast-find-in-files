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

function fastFindInFiles(options: FastFindInFilesOptions): FastFindInFiles[]
function fastFindInFiles(directory: string, needle: string | RegExp): FastFindInFiles[]
function fastFindInFiles(directory: string | FastFindInFilesOptions, needle?: string | RegExp): FastFindInFiles[] {
  let options = directory

  if (!directory) {
    throw new TypeError('Invalid input: Missing directory / options')
  }

  if (typeof directory === 'string') {
    if (!needle) {
      throw new TypeError('Invalid input: Missing needle')
    }

    options = {
      directory,
      needle: typeof needle === 'string' ? needle : needle.source,
    }
  }

  return binding.exportedFn(options)
}

export { fastFindInFiles }
