import { fastFindInFiles } from './index'

describe('does it trabajo', () => {
  it('sure does', () => {
    const result = fastFindInFiles('./fixtures', 'Curabitur mauris leo')

    expect(result).toMatchInlineSnapshot(`
      Array [
        Object {
          "filePath": "./fixtures/level0/level1/1.txt",
          "queryHits": Array [
            Object {
              "line": "Nunc sit amet accumsan eros. Nulla eget justo et nisi tempus imperdiet sed ac ex. Praesent feugiat nisi in imperdiet hendrerit. Curabitur mauris leo, ultricies eu pulvinar in, imperdiet sed est. Proin pharetra euismod mollis. Ut facilisis ligula nibh. Nulla facilisi. Nullam molestie, tellus eu finibus molestie, diam lacus porttitor lectus, ut sollicitudin justo purus eget orci. Sed pulvinar ante eget eros vestibulum, placerat dapibus dolor fermentum. Integer eget eleifend nisl. Pellentesque ultricies velit nisl, quis sagittis diam condimentum sed. Sed dictum hendrerit sodales.",
              "lineNumber": 11,
              "link": "./fixtures/level0/level1/1.txt:11:128",
              "offset": 128,
            },
          ],
          "totalHits": 1,
        },
      ]
    `)
  })

  it('sure does with RegExp string', () => {
    const result = fastFindInFiles('./fixtures', 'Curabitur m.* leo')

    expect(result).toMatchInlineSnapshot(`
      Array [
        Object {
          "filePath": "./fixtures/level0/level1/1.txt",
          "queryHits": Array [
            Object {
              "line": "Nunc sit amet accumsan eros. Nulla eget justo et nisi tempus imperdiet sed ac ex. Praesent feugiat nisi in imperdiet hendrerit. Curabitur mauris leo, ultricies eu pulvinar in, imperdiet sed est. Proin pharetra euismod mollis. Ut facilisis ligula nibh. Nulla facilisi. Nullam molestie, tellus eu finibus molestie, diam lacus porttitor lectus, ut sollicitudin justo purus eget orci. Sed pulvinar ante eget eros vestibulum, placerat dapibus dolor fermentum. Integer eget eleifend nisl. Pellentesque ultricies velit nisl, quis sagittis diam condimentum sed. Sed dictum hendrerit sodales.",
              "lineNumber": 11,
              "link": "./fixtures/level0/level1/1.txt:11:128",
              "offset": 128,
            },
          ],
          "totalHits": 1,
        },
      ]
    `)
  })

  it('sure does with RegExp', () => {
    const result = fastFindInFiles('./fixtures', new RegExp('Curabitur m.* leo'))

    expect(result).toMatchInlineSnapshot(`
      Array [
        Object {
          "filePath": "./fixtures/level0/level1/1.txt",
          "queryHits": Array [
            Object {
              "line": "Nunc sit amet accumsan eros. Nulla eget justo et nisi tempus imperdiet sed ac ex. Praesent feugiat nisi in imperdiet hendrerit. Curabitur mauris leo, ultricies eu pulvinar in, imperdiet sed est. Proin pharetra euismod mollis. Ut facilisis ligula nibh. Nulla facilisi. Nullam molestie, tellus eu finibus molestie, diam lacus porttitor lectus, ut sollicitudin justo purus eget orci. Sed pulvinar ante eget eros vestibulum, placerat dapibus dolor fermentum. Integer eget eleifend nisl. Pellentesque ultricies velit nisl, quis sagittis diam condimentum sed. Sed dictum hendrerit sodales.",
              "lineNumber": 11,
              "link": "./fixtures/level0/level1/1.txt:11:128",
              "offset": 128,
            },
          ],
          "totalHits": 1,
        },
      ]
    `)
  })
})
