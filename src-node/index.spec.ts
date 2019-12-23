import { quickFindInFiles } from './index'

describe('does it trabajo', () => {
  it('sure does', () => {
    const result = quickFindInFiles('./fixtures', 'Curabitur mauris leo')

    expect(result).toMatchInlineSnapshot()
  })
})
