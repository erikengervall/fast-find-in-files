---
id: getting-started
title: Getting Started
sidebar_label: Getting Started
---

## Example

```ts
import { quickFindInFiles } from 'quick-find-in-files'

const directory = process.cwd()
const needle = 'needle'

const result = quickFindInFiles(directory, needle)

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
