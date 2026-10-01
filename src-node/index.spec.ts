import fs from 'fs'
import os from 'os'
import path from 'path'

import { FastFindInFilesOptions, fastFindInFiles, fastFindInFilesAsync } from './index'

const filePaths = (options: FastFindInFilesOptions) => fastFindInFiles(options).map(({ filePath }) => filePath)
const hits = (options: FastFindInFilesOptions) =>
  fastFindInFiles(options).flatMap(({ queryHits }) =>
    queryHits.map(({ lineNumber, offset }) => `${lineNumber}:${offset}`),
  )

// Symlinks need privileges on Windows. Windows has no POSIX permissions, and root reads locked entries anyway.
const canSymlink = process.platform !== 'win32'
const canLock = canSymlink && process.getuid?.() !== 0

function makeTree(files: Record<string, string | Buffer>): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fast-find-in-files-'))
  for (const [file, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true })
    fs.writeFileSync(path.join(root, file), content)
  }
  return root
}

const LOREM_FILES = [
  './fixtures/level0/0.txt',
  './fixtures/level0/level1/1.txt',
  './fixtures/level0/level1/level2/2.txt',
  './fixtures/level0/level1/level2/level3/level3.1/3.1.md',
  './fixtures/level0/level1/level2.1/2.1.txt',
]

describe('fastFindInFiles', () => {
  describe('needles', () => {
    it('matches a string as exact text', () => {
      expect(fastFindInFiles({ directory: './fixtures', needle: 'Curabitur mauris leo' })).toMatchInlineSnapshot(`
        [
          {
            "filePath": "./fixtures/level0/level1/1.txt",
            "queryHits": [
              {
                "line": "Nunc sit amet accumsan eros. Nulla eget justo et nisi tempus imperdiet sed ac ex. Praesent feugiat nisi in imperdiet hendrerit. Curabitur mauris leo, ultricies eu pulvinar in, imperdiet sed est. Proin pharetra euismod mollis. Ut facilisis ligula nibh. Nulla facilisi. Nullam molestie, tellus eu finibus molestie, diam lacus porttitor lectus, ut sollicitudin justo purus eget orci. Sed pulvinar ante eget eros vestibulum, placerat dapibus dolor fermentum. Integer eget eleifend nisl. Pellentesque ultricies velit nisl, quis sagittis diam condimentum sed. Sed dictum hendrerit sodales.",
                "lineNumber": 11,
                "link": "./fixtures/level0/level1/1.txt:11:129",
                "offset": 128,
              },
            ],
            "totalHits": 1,
          },
        ]
      `)
    })

    it('does not treat regex characters in a string as a pattern', () => {
      expect(fastFindInFiles({ directory: './fixtures', needle: 'Curabitur m.* leo' })).toEqual([])
    })

    it('finds the same UUID in two nested files, sorted by path', () => {
      expect(filePaths({ directory: './fixtures', needle: '69a0d7b7-153b-497e-80e3-064cb40387b7' })).toEqual([
        './fixtures/level0/level1/level2/level3/3.js',
        './fixtures/level0/level1/level2.1/level3/level4/4.json',
      ])
    })

    it('matches a RegExp', () => {
      const result = fastFindInFiles({
        directory: './fixtures',
        needle: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
      })

      expect(result.map(({ queryHits }) => queryHits.map(({ link }) => link))).toEqual([
        ['./fixtures/level0/level1/level2/level3/3.js:7:27'],
        ['./fixtures/level0/level1/level2/level3/level3.1/3.1.md:9:26'],
        ['./fixtures/level0/level1/level2.1/level3/level4/4.json:7:27'],
      ])
    })

    it('honors RegExp flags and modern syntax', () => {
      expect(filePaths({ directory: './fixtures', needle: /CURABITUR MAURIS/i })).toEqual([
        './fixtures/level0/level1/1.txt',
      ])
      expect(filePaths({ directory: './fixtures', needle: /(?<=Curabitur )mauris\b/ })).toEqual([
        './fixtures/level0/level1/1.txt',
      ])
      expect(filePaths({ directory: './fixtures', needle: /'id-needle': '(?<id>[\da-f-]+)'/u })).toEqual([
        './fixtures/level0/level1/level2/level3/3.js',
      ])
    })

    it('does not mutate the options it is given', () => {
      const options = { directory: './fixtures', needle: /Lorem/, excludeFolderPaths: [/level2/, 'level0/'] }
      fastFindInFiles(options)

      expect(options).toEqual({ directory: './fixtures', needle: /Lorem/, excludeFolderPaths: [/level2/, 'level0/'] })
    })
  })

  describe('matching', () => {
    let root: string

    beforeAll(() => {
      root = makeTree({ 'lines.txt': 'first line\nNunc a\nab ab ab\naaa\n' })
    })

    afterAll(() => fs.rmSync(root, { recursive: true, force: true }))

    it.each<[string, string | RegExp]>([
      ['text', 'ab'],
      ['RegExp', /a[b]/],
    ])('reports every hit on a line for a %s needle, each carrying the line', (_, needle) => {
      const [result] = fastFindInFiles({ directory: root, needle })

      expect(result.totalHits).toBe(3)
      expect(result.queryHits).toEqual(
        [0, 3, 6].map((offset) => ({
          link: `${root}/lines.txt:3:${offset + 1}`,
          line: 'ab ab ab',
          lineNumber: 3,
          offset,
        })),
      )
    })

    it.each<[string, string | RegExp]>([
      ['text', 'aa'],
      ['RegExp', /a{2}/],
    ])('does not report overlapping matches for a %s needle', (_, needle) => {
      expect(hits({ directory: root, needle })).toEqual(['4:0'])
    })

    it('treats ^ and $ as line boundaries anywhere in the file', () => {
      expect(hits({ directory: root, needle: /^Nunc/ })).toEqual(['2:0'])
      expect(hits({ directory: root, needle: /ab$/ })).toEqual(['3:6'])
      expect(hits({ directory: root, needle: /^aaa$/ })).toEqual(['4:0'])
    })

    it('matches negative lookarounds per line', () => {
      expect(hits({ directory: root, needle: /ab(?! ab)/ })).toEqual(['3:6'])
      expect(hits({ directory: root, needle: /(?<!ab )ab/ })).toEqual(['3:0'])
      expect(hits({ directory: root, needle: /a(?!\n)/ })).toEqual(['2:5', '3:0', '3:3', '3:6', '4:0', '4:1', '4:2'])
    })

    it('finds every hit regardless of the g and y flags, leaving the RegExp untouched', () => {
      const sticky = /a[b]/y
      const global = /a[b]/g

      expect(hits({ directory: root, needle: sticky })).toEqual(['3:0', '3:3', '3:6'])
      expect(hits({ directory: root, needle: global })).toEqual(['3:0', '3:3', '3:6'])
      expect([sticky.lastIndex, global.lastIndex]).toEqual([0, 0])
    })

    it('skips zero-length matches', () => {
      expect(hits({ directory: root, needle: /z*/ })).toEqual([])
      expect(hits({ directory: root, needle: /a*/ })).toEqual(['2:5', '3:0', '3:3', '3:6', '4:0'])
    })

    it('matches a RegExp without special characters exactly like the same text', () => {
      expect(fastFindInFiles({ directory: root, needle: /Nunc a/ })).toEqual(
        fastFindInFiles({ directory: root, needle: 'Nunc a' }),
      )
      expect(hits({ directory: root, needle: /Nunc a/ })).toEqual(['2:0'])
    })

    it.each<[string, string | RegExp]>([
      ['text', 'needle'],
      ['RegExp', /ne{2}dle/],
    ])('shares one line string across hits instead of copying it per hit, for a %s needle', (_, needle) => {
      // A 1 MB line with 2,000 hits: copying the line per hit would cost about 2 GB of heap.
      const directory = makeTree({ 'minified.js': 'needle'.concat('x'.repeat(494)).repeat(2000) })
      try {
        const before = process.memoryUsage().heapUsed
        const [result] = fastFindInFiles({ directory, needle })
        const growth = process.memoryUsage().heapUsed - before

        expect(result.totalHits).toBe(2000)
        expect(growth).toBeLessThan(100 * 1024 * 1024)
      } finally {
        fs.rmSync(directory, { recursive: true, force: true })
      }
    })
  })

  describe('excludeFolderPaths', () => {
    it('excludes a folder by its full path', () => {
      expect(
        filePaths({
          directory: './fixtures',
          needle: 'Lorem ipsum',
          excludeFolderPaths: ['./fixtures/level0/level1/level2'],
        }),
      ).toEqual([
        './fixtures/level0/0.txt',
        './fixtures/level0/level1/1.txt',
        './fixtures/level0/level1/level2.1/2.1.txt',
      ])
    })

    it('excludes a folder by its path relative to directory, with or without a trailing slash', () => {
      const expected = ['./fixtures/level0/0.txt', './fixtures/level0/level1/1.txt']

      expect(
        filePaths({
          directory: './fixtures',
          needle: 'Lorem ipsum',
          excludeFolderPaths: ['level0/level1/level2', 'level0/level1/level2.1/'],
        }),
      ).toEqual(expected)
      expect(
        filePaths({
          directory: './fixtures/',
          needle: 'Lorem ipsum',
          excludeFolderPaths: ['./level0/level1/level2', 'level0/level1/level2.1'],
        }),
      ).toEqual(expected)
    })

    it('excludes folders whose path a RegExp matches', () => {
      expect(filePaths({ directory: './fixtures', needle: 'Lorem ipsum', excludeFolderPaths: [/level2/] })).toEqual([
        './fixtures/level0/0.txt',
        './fixtures/level0/level1/1.txt',
      ])
    })

    it('honors the i flag on an exclude RegExp', () => {
      expect(filePaths({ directory: './fixtures', needle: 'Lorem ipsum', excludeFolderPaths: [/LEVEL2/i] })).toEqual([
        './fixtures/level0/0.txt',
        './fixtures/level0/level1/1.txt',
      ])
    })

    it('excludes only the folder named, not a sibling sharing its prefix', () => {
      expect(
        filePaths({ directory: './fixtures', needle: 'Lorem ipsum', excludeFolderPaths: ['level0/level1/level2'] }),
      ).toContain('./fixtures/level0/level1/level2.1/2.1.txt')
    })
  })

  describe('file system edge cases', () => {
    let root: string

    beforeAll(() => {
      root = makeTree({
        'visible.txt': 'needle\r\nsecond needle line\r\n',
        '.env': 'needle in a dotfile',
        '.hidden/inside.txt': 'needle in a hidden folder',
        'binary.dat': Buffer.from([0x6e, 0x65, 0x65, 0x64, 0x6c, 0x65, 0x00, 0x01]),
        'unicode.txt': 'åäö 😀 needle',
        'locked/secret.txt': 'needle behind a locked folder',
        'unreadable.txt': 'needle in an unreadable file',
      })
      if (canSymlink) fs.symlinkSync(path.join(root, 'missing-target'), path.join(root, 'broken-link'))
      if (canLock) {
        fs.chmodSync(path.join(root, 'locked'), 0o000)
        fs.chmodSync(path.join(root, 'unreadable.txt'), 0o000)
      } else {
        fs.rmSync(path.join(root, 'locked'), { recursive: true })
        fs.rmSync(path.join(root, 'unreadable.txt'))
      }
    })

    afterAll(() => {
      if (canLock) fs.chmodSync(path.join(root, 'locked'), 0o755)
      fs.rmSync(root, { recursive: true, force: true })
    })

    it.each<[string, string | RegExp]>([
      ['text', 'needle'],
      ['RegExp', /needle/],
    ])(
      'skips hidden entries, binary files, broken links, and unreadable files and folders for a %s needle',
      async (_, needle) => {
        const expected = [`${root}/unicode.txt`, `${root}/visible.txt`]

        expect(filePaths({ directory: root, needle })).toEqual(expected)
        expect((await fastFindInFilesAsync({ directory: root, needle })).map(({ filePath }) => filePath)).toEqual(
          expected,
        )
      },
    )

    it('searches hidden entries with includeHidden, sync and async', async () => {
      const options = { directory: root, needle: /needle/, includeHidden: true }

      expect(await fastFindInFilesAsync(options)).toEqual(fastFindInFiles(options))
      expect(filePaths({ directory: root, needle: 'needle', includeHidden: true })).toEqual([
        `${root}/.env`,
        `${root}/.hidden/inside.txt`,
        `${root}/unicode.txt`,
        `${root}/visible.txt`,
      ])
    })

    it('strips Windows line endings from lines', () => {
      const [result] = fastFindInFiles({ directory: root, needle: 'second' })

      expect(result.queryHits[0]).toEqual({
        link: `${root}/visible.txt:2:1`,
        line: 'second needle line',
        lineNumber: 2,
        offset: 0,
      })
    })

    it.each<[string, string | RegExp]>([
      ['text', 'needle'],
      ['RegExp', /ne+dle/],
    ])('reports offsets in JS string units for a %s needle', (_, needle) => {
      const [result] = fastFindInFiles({ directory: root, needle }).filter(({ filePath }) =>
        filePath.endsWith('unicode.txt'),
      )
      const { line, offset, link } = result.queryHits[0]

      expect(line.slice(offset)).toBe('needle')
      expect(link).toBe(`${root}/unicode.txt:1:${offset + 1}`)
    })

    it('throws a catchable error for a directory it cannot read', () => {
      expect(() => fastFindInFiles({ directory: path.join(root, 'nope'), needle: 'x' })).toThrow(
        /Unable to read directory/,
      )
      expect(() => fastFindInFiles({ directory: path.join(root, 'visible.txt'), needle: 'x' })).toThrow(
        /Unable to read directory/,
      )
    })

    ;(canSymlink ? it : it.skip)('searches symlinked files but does not follow symlinked folders', () => {
      const directory = makeTree({ 'real/target.txt': 'needle via a link' })
      try {
        fs.symlinkSync(path.join(directory, 'real/target.txt'), path.join(directory, 'linked.txt'))
        fs.symlinkSync(path.join(directory, 'real'), path.join(directory, 'linked-folder'))

        expect(filePaths({ directory, needle: 'needle' })).toEqual([
          `${directory}/linked.txt`,
          `${directory}/real/target.txt`,
        ])
      } finally {
        fs.rmSync(directory, { recursive: true, force: true })
      }
    })

    it('strips trailing slashes from directory without doubling the separator', () => {
      const [first] = filePaths({ directory: `${root}//`, needle: 'needle' })

      expect(first).toBe(`${root}/unicode.txt`)
    })

    it('throws a catchable error for an exclude pattern the native engine rejects', () => {
      expect(() => fastFindInFiles({ directory: root, needle: 'x', excludeFolderPaths: [/{/] })).toThrow(
        /Invalid exclude pattern/,
      )
    })
  })

  it.each([
    { options: undefined },
    { options: null },
    { options: {} },
    { options: { directory: 123 } },
    { options: { directory: '' } },
    { options: { directory: './fixtures', needle: '' } },
    { options: { directory: './fixtures', needle: 'two\nlines' } },
    { options: { directory: './fixtures', needle: 'valid', includeHidden: 'yes' } },
    { options: { directory: './fixtures', needle: 'valid', excludeFolderPaths: 'level0' } },
    { options: { directory: './fixtures', needle: 'valid', excludeFolderPaths: [123] } },
    { options: { directory: './fixtures', needle: 'valid', excludeFolderPaths: [''] } },
    { options: { directory: './fixtures', needle: 'valid', excludeFolderPaths: ['/'] } },
    { options: { directory: './fixtures', needle: 'valid', excludeFolderPaths: [/(?<=a)b/] } },
    { options: { directory: './fixtures', needle: 'valid', excludeFolderPaths: [/a/u] } },
  ])('throws for invalid options: "%o"', ({ options }) => {
    expect(() => fastFindInFiles(options as any)).toThrowErrorMatchingSnapshot()
  })
})

describe('fastFindInFilesAsync', () => {
  it.each<[string, string | RegExp]>([
    ['text', 'Lorem ipsum'],
    ['RegExp', /lorem\s+IPSUM/i],
  ])('returns the same results as the sync search for a %s needle', async (_, needle) => {
    const options = { directory: './fixtures', needle, excludeFolderPaths: ['level0/level1/level2.1'] }

    expect(await fastFindInFilesAsync(options)).toEqual(fastFindInFiles(options))
    expect((await fastFindInFilesAsync({ directory: './fixtures', needle })).map(({ filePath }) => filePath)).toEqual(
      LOREM_FILES,
    )
  })

  it('rejects instead of throwing', async () => {
    await expect(
      fastFindInFilesAsync({ directory: './fixtures', needle: 'x', excludeFolderPaths: [/{/] }),
    ).rejects.toThrow(/Invalid exclude pattern/)
    await expect(fastFindInFilesAsync({ directory: './fixtures/nope', needle: 'x' })).rejects.toThrow(
      /Unable to read directory/,
    )
    await expect(fastFindInFilesAsync({ directory: '', needle: 'x' })).rejects.toThrow(TypeError)
  })
})
