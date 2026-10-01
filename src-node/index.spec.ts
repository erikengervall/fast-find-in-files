import fs from 'fs'
import os from 'os'
import path from 'path'

import { FastFindInFilesOptions, fastFindInFiles, fastFindInFilesAsync } from './index'

const filePaths = (options: FastFindInFilesOptions) => fastFindInFiles(options).map(({ filePath }) => filePath)

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

    it('reports every hit on a line with JS string offsets', () => {
      const [result] = fastFindInFiles({ directory: './fixtures/level0/level1', needle: /Curabitur m\w+/g })

      expect(result.queryHits.map(({ offset, line }) => line.slice(offset, offset + 16))).toEqual(['Curabitur mauris'])
    })

    it('does not mutate the options it is given', () => {
      const options = { directory: './fixtures', needle: /Lorem/, excludeFolderPaths: [/level2/, 'level0/'] }
      fastFindInFiles(options)

      expect(options).toEqual({ directory: './fixtures', needle: /Lorem/, excludeFolderPaths: [/level2/, 'level0/'] })
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
  })

  describe('file system edge cases', () => {
    // Windows has no POSIX permissions or unprivileged symlinks, and root reads locked folders anyway.
    const canLock = process.platform !== 'win32' && process.getuid?.() !== 0
    let root: string

    beforeAll(() => {
      root = fs.mkdtempSync(path.join(os.tmpdir(), 'fast-find-in-files-'))
      const write = (file: string, content: string | Buffer) => {
        fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true })
        fs.writeFileSync(path.join(root, file), content)
      }
      write('visible.txt', 'needle\r\nsecond needle line\r\n')
      write('.env', 'needle in a dotfile')
      write('.hidden/inside.txt', 'needle in a hidden folder')
      write('binary.dat', Buffer.from([0x6e, 0x65, 0x65, 0x64, 0x6c, 0x65, 0x00, 0x01]))
      write('unicode.txt', 'åäö 😀 needle')
      if (canLock) {
        fs.symlinkSync(path.join(root, 'missing-target'), path.join(root, 'broken-link'))
        write('locked/secret.txt', 'needle behind a locked folder')
        fs.chmodSync(path.join(root, 'locked'), 0o000)
      }
    })

    afterAll(() => {
      if (canLock) fs.chmodSync(path.join(root, 'locked'), 0o755)
      fs.rmSync(root, { recursive: true, force: true })
    })

    it('skips hidden entries, binary files, broken links, and unreadable folders without failing', () => {
      expect(filePaths({ directory: root, needle: 'needle' })).toEqual([`${root}/unicode.txt`, `${root}/visible.txt`])
      expect(filePaths({ directory: root, needle: /needle/ })).toEqual([`${root}/unicode.txt`, `${root}/visible.txt`])
    })

    it('searches hidden entries with includeHidden', () => {
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
    await expect(fastFindInFilesAsync({ directory: './fixtures/nope', needle: 'x' })).rejects.toThrow(
      /Unable to read directory/,
    )
    await expect(fastFindInFilesAsync({ directory: '', needle: 'x' })).rejects.toThrow(TypeError)
  })
})
