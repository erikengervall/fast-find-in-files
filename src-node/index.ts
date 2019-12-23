// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import binding from '../build/Release/binding.node'

const bindingWrapper = (directory: string, needle: string) => {
  if (!directory) {
    throw new TypeError('Invalid input: Missing directory')
  }
  if (!needle) {
    throw new TypeError('Invalid input: Missing needle')
  }

  const result = binding.exportedFn(directory, needle)

  return result
}

export { bindingWrapper as quickFindInFiles }
