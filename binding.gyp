{
  "targets": [
    {
      "target_name": "fast_find_in_files",
      "sources": ["./src/index.cc", "./src/search.cc"],
      "include_dirs": ["<!@(node -p \"require('node-addon-api').include\")"],
      "defines": ["NAPI_DISABLE_CPP_EXCEPTIONS"],
      "cflags!": ["-fno-exceptions"],
      "cflags_cc!": ["-fno-exceptions"],
      "xcode_settings": {
        "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
        "MACOSX_DEPLOYMENT_TARGET": "11.0"
      },
      "msvs_settings": {
        "VCCLCompilerTool": { "ExceptionHandling": 1 }
      },
      "conditions": [
        [
          "OS=='win'",
          {
            # Node sets _HAS_EXCEPTIONS=0 on Windows, where std::exception keeps a pointer to its message instead of a
            # copy, so every runtime_error message dangles. node-addon-api's except.gypi sets it back the same way.
            "defines": ["_HAS_EXCEPTIONS=1"]
          }
        ]
      ]
    }
  ]
}
