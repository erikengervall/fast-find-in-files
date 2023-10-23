# Fast Find in Files

`fast-find-in-files` recursively searches all files in selected directory and sub-directories for text matches using
partial string matching or regular expressions. The library is built entirely in C++ and exposes its functionality using
[node-addon-api](https://github.com/nodejs/node-addon-api).

<p align="center">
  <img alt="fast-find-in-files logo" width="300px" src="https://raw.githubusercontent.com/erikengervall/fast-find-in-files/master/resources/img/logo.png">
</p>

<br>
<br>

<p align="center">
  <img alt="licence" src="https://github.com/erikengervall/fast-find-in-files/workflows/Node.js%20CI/badge.svg">

  <a href="https://www.npmjs.com/package/fast-find-in-files">
    <img alt="npm downloads" src="https://img.shields.io/npm/dm/fast-find-in-files.svg?style=flat">
  </a>
  <a href="https://github.com/erikengervall/fast-find-in-files/blob/master/LICENSE">
    <img alt="licence" src="https://img.shields.io/npm/l/fast-find-in-files.svg?style=flat">
  </a>
<p>

# Example

```ts
import { fastFindInFiles } from 'fast-find-in-files'

const directory = process.cwd()
const needle = 'needle' // also supports string RegExp: 'needle*', and RegExp instances: new RegExp('needle*')

const result = fastFindInFiles({ directory, needle })

console.log(result)
// [
//   {
//     filePath: '<path>',
//     queryHits: [
//       {
//         line: 'It would appear there is a <needle> on this particular line',
//         lineNumber: 1,
//         link: '<path>:1:28',
//         offset: 28,
//       },
//     ],
//     totalHits: 1,
//   },
// ]
```

# Development

### Install dependencies

```sh
yarn install
```

## Build

```sh
yarn build
```

## Test

```sh
yarn test
```

## Release

1. Bump version in `package.json` & `lerna.json` (create PR -> merge)
2. Create a new release on GitHub. This will also create a tag which will trigger the CI to publish a new version to npm

## Documentation

Learn more about `fast-find-in-files` on the [official website](https://erikengervall.github.io/fast-find-in-files).

## Contributing

If you'd like to contribute, start by searching through the issues and pull requests to see whether someone else has
raised a similar idea or question.

If you don't see your idea listed, and you think it fits into the goals of this guide, do one of the following:

- If your contribution is **minor**, such as a typo fix, open a pull request.
- If your contribution is **major**, such as a new feature, start by opening an issue first. That way, other people can
  weigh in on the discussion before you do any work.

## License

MIT
