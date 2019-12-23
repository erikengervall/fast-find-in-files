import { quickFindInFiles } from './index'

describe('does it trabajo', () => {
  it('sure does', () => {
    const result = quickFindInFiles('./fixtures', 'Lorem')

    expect(result).toMatchSnapshot()
  })
})
