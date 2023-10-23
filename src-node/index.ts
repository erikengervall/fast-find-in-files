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

const bindingWrapper = (directory: string, needle: string | RegExp): FastFindInFiles[] => {
  if (!directory) {
    throw new TypeError('Invalid input: Missing directory')
  }

  if (!needle) {
    throw new TypeError('Invalid input: Missing needle')
  }

  const needleStr = needle instanceof RegExp ? needle.source : needle

  return binding.exportedFn(directory, needleStr)
}

export { bindingWrapper as fastFindInFiles }
