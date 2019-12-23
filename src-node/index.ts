// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import binding from '../build/Release/binding.node'

interface QueryHit {
  link: string
  line: string
  lineNumber: number
  offset: number
}

interface fastFindInFiles {
  filePath: string
  totalHits: number
  queryHits: QueryHit[]
}

const bindingWrapper = (directory: string, needle: string): fastFindInFiles[] => {
  if (!directory) {
    throw new TypeError('Invalid input: Missing directory')
  }
  if (!needle) {
    throw new TypeError('Invalid input: Missing needle')
  }

  return binding.exportedFn(directory, needle)
}

export { bindingWrapper as fastFindInFiles }
