# Fast Find in Files

⚡️ Recursively search a directory's files for text or a RegExp, powered by a native C++ addon.

<p align="center">
  <img alt="fast-find-in-files logo" width="300px" src="https://raw.githubusercontent.com/erikengervall/fast-find-in-files/master/resources/img/logo.png">
</p>

<p align="center">
  <a href="https://github.com/erikengervall/fast-find-in-files/actions/workflows/ci.yml">
    <img alt="CI" src="https://github.com/erikengervall/fast-find-in-files/actions/workflows/ci.yml/badge.svg">
  </a>
  <a href="https://www.npmjs.com/package/fast-find-in-files">
    <img alt="npm downloads" src="https://img.shields.io/npm/dm/fast-find-in-files.svg?style=flat">
  </a>
  <a href="https://github.com/erikengervall/fast-find-in-files/blob/master/LICENSE">
    <img alt="license" src="https://img.shields.io/npm/l/fast-find-in-files.svg?style=flat">
  </a>
</p>

Folder walking and plain-text search run in C++ through [node-addon-api](https://github.com/nodejs/node-addon-api).
RegExp searches use JavaScript's own regex engine on files the native walker finds, so every flag and syntax feature
behaves exactly as it does in `String.prototype.matchAll`.

Prebuilt binaries ship for Linux (x64 and arm64, glibc and musl), macOS (x64 and arm64), and Windows (x64 and arm64), so
installing needs no compiler. Other platforms build from source on install, which needs Python and a C++ toolchain.

## Install

```sh
npm install fast-find-in-files
```

Requires Node.js 22 or later.

## Usage

```ts
import { fastFindInFiles, fastFindInFilesAsync } from 'fast-find-in-files'

const result = fastFindInFiles({ directory: process.cwd(), needle: 'needle' })

console.log(result)
// [
//   {
//     filePath: './notes/haystack.txt',
//     totalHits: 1,
//     queryHits: [
//       {
//         link: './notes/haystack.txt:1:28',
//         line: 'It would appear there is a needle on this particular line',
//         lineNumber: 1,
//         offset: 27,
//       },
//     ],
//   },
// ]

// Same options and results, without blocking the event loop
const sameResult = await fastFindInFilesAsync({ directory: process.cwd(), needle: /need(le|s)/i })
```

### Options

| Option               | Type                   | Description                                                                                                                                                                                                                                                       |
| -------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `directory`          | `string`               | Absolute or relative directory to search.                                                                                                                                                                                                                         |
| `needle`             | `string \| RegExp`     | A string is matched as exact text. A RegExp is matched line by line with every flag honored.                                                                                                                                                                      |
| `excludeFolderPaths` | `(string \| RegExp)[]` | Folders to skip. A string is a folder path, either as it appears in `filePath` or relative to `directory`. A RegExp is tested against the folder's full path; the `i` flag is honored, and lookbehind, named groups, and Unicode features are not available here. |
| `includeHidden`      | `boolean`              | Also search files and folders whose names start with a dot, such as `.github` or `.env`. Defaults to `false`.                                                                                                                                                     |

### Results

Results are sorted by file path. Each hit carries:

- `line`: the full line, without its line ending
- `lineNumber`: 1-based
- `offset`: 0-based index of the hit in `line`, in JS string units, so `line.slice(offset)` starts at the hit
- `link`: `<filePath>:<lineNumber>:<column>` with a 1-based column, ready to open in an editor

Binary files (a NUL byte in the first 8,000 bytes) are skipped. Symlinked files are searched; symlinked folders are not
followed.

### Errors

`fastFindInFiles` throws, and `fastFindInFilesAsync` rejects, when the options are invalid or `directory` cannot be
read. Files and folders below it that cannot be read (permission denied, broken symlinks) are skipped.

## Upgrading from 1.x

- A string `needle` is now exact text. Pass a `RegExp` to search by pattern, for example `/needle.*/` instead of
  `'needle.*'`.
- RegExp needles use JavaScript semantics, including flags such as `i` and `u`, lookbehind, and `\d`.
- `offset` counts JS string units instead of UTF-8 bytes, and the column in `link` is 1-based.
- Errors are thrown as JS errors instead of ending the process.
- A RegExp in `excludeFolderPaths` matches anywhere in the folder path, as `RegExp.test` does; 1.x required it to match
  the whole path.
- Hidden files and folders are still skipped by default; `includeHidden: true` includes them.
- Results are sorted by path, binary files are skipped, and line endings are stripped from `line`.
- Node.js 22 or later is required.

## Development

```sh
yarn install   # installs dependencies and compiles the addon
yarn build     # compiles the TypeScript
yarn test
yarn lint
```

## Releasing

Releases are automated with [release-please](https://github.com/googleapis/release-please). Commit messages (the pull
request title, since pull requests are squash-merged) follow
[Conventional Commits](https://www.conventionalcommits.org): `fix:` releases a patch, `feat:` a minor version, and
`feat!:` or a `BREAKING CHANGE:` footer a major version.

Each push to `master` updates a release pull request with the version bump and changelog. Merging it tags the release,
builds and tests a binary for every platform, and publishes to npm from GitHub Actions through trusted publishing, with
provenance.

## Contributing

If you'd like to contribute, start by searching through the issues and pull requests to see whether someone else has
raised a similar idea or question.

- If your contribution is **minor**, such as a typo fix, open a pull request.
- If your contribution is **major**, such as a new feature, open an issue first so other people can weigh in before you
  do any work.

## License

MIT
