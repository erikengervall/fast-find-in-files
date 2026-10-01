declare module 'node-gyp-build' {
  /**
   * Loads the addon from `prebuilds/<platform>-<arch>/` when one matches, otherwise from `build/Release/`.
   */
  function load(directory: string): unknown
  export = load
}
