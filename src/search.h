#pragma once

#include <cstddef>
#include <string>
#include <vector>

struct Pattern {
    std::string source;
    bool ignoreCase = false;
};

struct WalkOptions {
    std::string directory;
    bool includeHidden = false;
    // Folders matched exactly, either as the full path or relative to `directory`.
    std::vector<std::string> excludePaths;
    // ECMAScript patterns searched for anywhere in a folder's full path.
    std::vector<Pattern> excludePatterns;
};

struct Line {
    std::string text;
    int number;
};

struct Hit {
    std::size_t lineIndex;  // Index into Result::lines
    std::size_t offset;     // UTF-16 code units from the start of the line, matching JS string indices
};

struct Result {
    std::string filePath;
    // Each line with at least one hit, stored once however many hits it holds.
    std::vector<Line> lines;
    std::vector<Hit> hits;
};

// Both throw std::runtime_error when the directory cannot be read or an exclude pattern is invalid. Unreadable
// entries below the root (permission denied, broken symlinks) are skipped. Output is sorted by path.

// Every regular file under the directory, after hidden and exclude filtering.
std::vector<std::string> listFiles(const WalkOptions& options);

// Exact-text search for `needle` in every non-binary file under the directory.
std::vector<Result> searchText(const WalkOptions& options, const std::string& needle);
