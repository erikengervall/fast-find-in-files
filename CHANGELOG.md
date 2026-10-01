# Changelog

## [2.0.0](https://github.com/erikengervall/fast-find-in-files/compare/v1.0.5...v2.0.0) (2026-10-01)


### ⚠ BREAKING CHANGES

* a string needle is matched as exact text; pass a RegExp to search by pattern. RegExp needles use JavaScript syntax. offset counts JS string units and the link column is 1-based. Errors throw instead of exiting. A RegExp in excludeFolderPaths matches anywhere in the folder path. Node.js 22 or later is required.

### Features

* v2: catchable errors, faster search, async API, prebuilt binaries ([#72](https://github.com/erikengervall/fast-find-in-files/issues/72)) ([ca7e022](https://github.com/erikengervall/fast-find-in-files/commit/ca7e022e58150987244c523efe33c4da5c249bd0))
