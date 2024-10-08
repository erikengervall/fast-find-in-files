import { fastFindInFiles } from './index'

describe('fastFindInFiles', () => {
  it('works with string', () => {
    const result = fastFindInFiles({ directory: './fixtures', needle: 'Curabitur mauris leo' })

    expect(result).toMatchInlineSnapshot(`
      [
        {
          "filePath": "./fixtures/level0/level1/1.txt",
          "queryHits": [
            {
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

  it('should find the two nested files with UUID "69a0d7b7-153b-497e-80e3-064cb40387b7"', () => {
    const result = fastFindInFiles({ directory: './fixtures', needle: '69a0d7b7-153b-497e-80e3-064cb40387b7' })

    expect(result).toMatchInlineSnapshot(`
      [
        {
          "filePath": "./fixtures/level0/level1/level2/level3/3.js",
          "queryHits": [
            {
              "line": "            'id-needle': '69a0d7b7-153b-497e-80e3-064cb40387b7', // same as \`fixtures/level0/level1/level2.1/level3/level4/4.json\`",
              "lineNumber": 7,
              "link": "./fixtures/level0/level1/level2/level3/3.js:7:26",
              "offset": 26,
            },
          ],
          "totalHits": 1,
        },
        {
          "filePath": "./fixtures/level0/level1/level2.1/level3/level4/4.json",
          "queryHits": [
            {
              "line": "            "id-needle": "69a0d7b7-153b-497e-80e3-064cb40387b7"",
              "lineNumber": 7,
              "link": "./fixtures/level0/level1/level2.1/level3/level4/4.json:7:26",
              "offset": 26,
            },
          ],
          "totalHits": 1,
        },
      ]
    `)
  })

  it('should find the three UUIDs by RegExp', () => {
    const result = fastFindInFiles({
      directory: './fixtures',
      /**
       * @link https://stackoverflow.com/a/6640851
       */
      needle: new RegExp('[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'),
    })

    expect(result).toHaveLength(3)

    expect(
      result.filter((r) => {
        return (
          JSON.stringify(r) ===
          JSON.stringify({
            filePath: './fixtures/level0/level1/level2/level3/3.js',
            totalHits: 1,
            queryHits: [
              {
                link: './fixtures/level0/level1/level2/level3/3.js:7:26',
                line: "            'id-needle': '69a0d7b7-153b-497e-80e3-064cb40387b7', // same as `fixtures/level0/level1/level2.1/level3/level4/4.json`",
                lineNumber: 7,
                offset: 26,
              },
            ],
          })
        )
      }),
    ).toHaveLength(1)

    expect(
      result.filter((r) => {
        return (
          JSON.stringify(r) ===
          JSON.stringify({
            filePath: './fixtures/level0/level1/level2/level3/level3.1/3.1.md',
            totalHits: 1,
            queryHits: [
              {
                link: './fixtures/level0/level1/level2/level3/level3.1/3.1.md:9:25',
                line: 'Vestibulum ante the UUID d0ff83b6-1935-4770-ad55-0fdf61a2c7c8 is totally hidden in here ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Aliquam sit amet ex risus. Duis non tincidunt quam. Vivamus bibendum sagittis odio, a tincidunt lectus venenatis vel.',
                lineNumber: 9,
                offset: 25,
              },
            ],
          })
        )
      }),
    ).toHaveLength(1)

    expect(
      result.filter((r) => {
        return (
          JSON.stringify(r) ===
          JSON.stringify({
            filePath: './fixtures/level0/level1/level2.1/level3/level4/4.json',
            totalHits: 1,
            queryHits: [
              {
                link: './fixtures/level0/level1/level2.1/level3/level4/4.json:7:26',
                line: '            "id-needle": "69a0d7b7-153b-497e-80e3-064cb40387b7"',
                lineNumber: 7,
                offset: 26,
              },
            ],
          })
        )
      }),
    ).toHaveLength(1)
  })

  it('works with RegExp string', () => {
    const result = fastFindInFiles({ directory: './fixtures', needle: 'Curabitur m.* leo' })

    expect(result).toMatchInlineSnapshot(`
      [
        {
          "filePath": "./fixtures/level0/level1/1.txt",
          "queryHits": [
            {
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

  it('works with RegExp', () => {
    const result = fastFindInFiles({ directory: './fixtures', needle: new RegExp('Curabitur m.* leo') })

    expect(result).toMatchInlineSnapshot(`
      [
        {
          "filePath": "./fixtures/level0/level1/1.txt",
          "queryHits": [
            {
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

  it('works with options', () => {
    const result = fastFindInFiles({
      directory: './fixtures',
      needle: 'Lorem ipsum',
    })

    expect(result.map(({ filePath }) => filePath)).toEqual(
      // Use `expect.arrayContaining` to ignore the order of the results as CI might run on different machines
      expect.arrayContaining([
        './fixtures/level0/0.txt',
        './fixtures/level0/level1/level2/level3/level3.1/3.1.md',
        './fixtures/level0/level1/level2/2.txt',
        './fixtures/level0/level1/1.txt',
        './fixtures/level0/level1/level2.1/2.1.txt',
      ]),
    )
  })

  it('works with exclude paths', () => {
    const result = fastFindInFiles({
      directory: './fixtures',
      needle: 'Lorem ipsum',
      excludeFolderPaths: ['./fixtures/level0/level1/level2'],
    })

    expect(result.map(({ filePath }) => filePath)).toEqual(
      // Use `expect.arrayContaining` to ignore the order of the results as CI might run on different machines
      expect.arrayContaining([
        './fixtures/level0/0.txt',
        './fixtures/level0/level1/1.txt',
        './fixtures/level0/level1/level2.1/2.1.txt',
      ]),
    )
  })

  it('works with regexp exclude paths', () => {
    const result = fastFindInFiles({
      directory: './fixtures',
      needle: 'Lorem ipsum',
      excludeFolderPaths: [/level2/],
    })

    expect(result.map(({ filePath }) => filePath)).toEqual(
      // Use `expect.arrayContaining` to ignore the order of the results as CI might run on different machines
      expect.arrayContaining(['./fixtures/level0/0.txt', './fixtures/level0/level1/1.txt']),
    )
  })

  it.each([
    { options: undefined },
    { options: null },
    { options: {} },
    { options: { directory: 123 } },
    { options: { directory: '' } },
    { options: { directory: './fixtures', needle: '' } },
    { options: { directory: './fixtures', needle: 'valid', excludeFolderPaths: [123] } },
    { options: { directory: './fixtures', needle: 'valid', excludeFolderPaths: [''] } },
    { options: { directory: './fixtures', needle: 'valid', excludeFolderPaths: ['some/path/'] } },
  ])('throws for invalid options: "%o"', ({ options }) => {
    expect(() => fastFindInFiles(options as any)).toThrowErrorMatchingSnapshot()
  })
})
