#ifdef _MSC_VER
#include "dirent.h"
#else
#include <dirent.h>
#endif

#include <sys/stat.h>

#include <algorithm>
#include <cerrno>
#include <cstdio>
#include <cstring>
#include <functional>
#include <regex>
#include <stdexcept>
#include <string>
#include <vector>

#include "search.h"

namespace {

// Same heuristic as git: a NUL byte near the start of a file marks it as binary.
const std::size_t BINARY_SNIFF_BYTES = 8000;

enum class EntryKind { File, Directory, Other };

struct Walker {
    const WalkOptions& options;
    std::string root;
    std::vector<std::regex> excludeRegexes;
    std::function<void(const std::string&)> onFile;
};

std::regex compile(const Pattern& pattern) {
    auto flags = std::regex::ECMAScript | std::regex::optimize;
    if (pattern.ignoreCase) flags |= std::regex::icase;
    try {
        return std::regex(pattern.source, flags);
    } catch (const std::regex_error& error) {
        throw std::runtime_error("Invalid exclude pattern /" + pattern.source + "/: " + error.what());
    }
}

std::string stripTrailingSlashes(std::string path) {
    while (path.size() > 1 && (path.back() == '/' || path.back() == '\\')) path.pop_back();
    return path;
}

std::string join(const std::string& directory, const std::string& name) {
    const char last = directory.back();
    return (last == '/' || last == '\\') ? directory + name : directory + "/" + name;
}

bool isDotEntry(const char* name) {
    return name[0] == '.' && (name[1] == '\0' || (name[1] == '.' && name[2] == '\0'));
}

EntryKind kindOf(const std::string& path, unsigned char type) {
    if (type == DT_REG) return EntryKind::File;
    if (type == DT_DIR) return EntryKind::Directory;
    if (type != DT_UNKNOWN && type != DT_LNK) return EntryKind::Other;

    // Some filesystems report DT_UNKNOWN, and a symlink needs its target's type. stat follows symlinks and fails for
    // broken ones, which are skipped.
    struct stat info;
    if (stat(path.c_str(), &info) != 0) return EntryKind::Other;
    if (S_ISREG(info.st_mode)) return EntryKind::File;
    // Symlinked folders are not followed, which also rules out symlink loops.
    if (S_ISDIR(info.st_mode) && type == DT_UNKNOWN) return EntryKind::Directory;
    return EntryKind::Other;
}

bool isExcluded(const Walker& walker, const std::string& path) {
    const std::string relative = path.substr(join(walker.root, "").size());
    for (const auto& excludePath : walker.options.excludePaths) {
        if (excludePath == path || excludePath == relative) return true;
        if (excludePath.compare(0, 2, "./") == 0 && excludePath.compare(2, std::string::npos, relative) == 0) return true;
    }
    for (const auto& regex : walker.excludeRegexes) {
        if (std::regex_search(path, regex)) return true;
    }
    return false;
}

void walk(const Walker& walker, const std::string& directory, bool isRoot) {
    DIR* dir = opendir(directory.c_str());
    if (dir == nullptr) {
        if (!isRoot) return;
        throw std::runtime_error("Unable to read directory \"" + directory + "\": " + std::strerror(errno));
    }

    struct Entry {
        std::string name;
        unsigned char type;
    };
    std::vector<Entry> entries;
    while (struct dirent* ent = readdir(dir)) {
        if (isDotEntry(ent->d_name)) continue;
        if (!walker.options.includeHidden && ent->d_name[0] == '.') continue;
        entries.push_back({ent->d_name, static_cast<unsigned char>(ent->d_type)});
    }
    closedir(dir);

    // readdir order differs between filesystems; sorting keeps results stable everywhere.
    std::sort(entries.begin(), entries.end(), [](const Entry& a, const Entry& b) { return a.name < b.name; });

    for (const auto& entry : entries) {
        const std::string path = join(directory, entry.name);
        switch (kindOf(path, entry.type)) {
            case EntryKind::File:
                walker.onFile(path);
                break;
            case EntryKind::Directory:
                if (!isExcluded(walker, path)) walk(walker, path, false);
                break;
            case EntryKind::Other:
                break;
        }
    }
}

void walkFiles(const WalkOptions& options, std::function<void(const std::string&)> onFile) {
    Walker walker{options, stripTrailingSlashes(options.directory), {}, std::move(onFile)};
    for (const auto& pattern : options.excludePatterns) walker.excludeRegexes.push_back(compile(pattern));
    walk(walker, walker.root, true);
}

bool readFile(const std::string& path, std::string& content) {
    std::FILE* file = std::fopen(path.c_str(), "rb");
    if (file == nullptr) return false;

    char buffer[1 << 16];
    std::size_t read;
    while ((read = std::fread(buffer, 1, sizeof(buffer), file)) > 0) content.append(buffer, read);
    const bool ok = !std::ferror(file);
    std::fclose(file);
    return ok;
}

std::size_t utf16Length(const char* text, std::size_t bytes) {
    std::size_t units = 0;
    for (std::size_t i = 0; i < bytes; i++) {
        const unsigned char byte = static_cast<unsigned char>(text[i]);
        if ((byte & 0xC0) != 0x80) units++;  // Not a continuation byte, so a new code point starts here
        if (byte >= 0xF0) units++;           // Four-byte sequences are surrogate pairs in UTF-16
    }
    return units;
}

void findText(const std::string& content, const std::string& needle, Result& result) {
    const char* data = content.data();
    const char* end = data + content.size();
    const char* lineStart = data;
    int lineNumber = 1;

    for (std::size_t position = content.find(needle); position != std::string::npos;
         position = content.find(needle, position + needle.size())) {
        const char* match = data + position;
        // Advance the line cursor to the line holding this match.
        for (const char* newline; (newline = static_cast<const char*>(std::memchr(lineStart, '\n', match - lineStart)));) {
            lineStart = newline + 1;
            lineNumber++;
        }

        if (result.lines.empty() || result.lines.back().number != lineNumber) {
            const char* lineEnd = static_cast<const char*>(std::memchr(match, '\n', end - match));
            if (lineEnd == nullptr) lineEnd = end;
            if (lineEnd > lineStart && *(lineEnd - 1) == '\r') lineEnd--;
            result.lines.push_back({std::string(lineStart, lineEnd), lineNumber});
        }
        result.hits.push_back({result.lines.size() - 1, utf16Length(lineStart, match - lineStart)});
    }
}

}  // namespace

std::vector<std::string> listFiles(const WalkOptions& options) {
    std::vector<std::string> files;
    walkFiles(options, [&files](const std::string& path) { files.push_back(path); });
    return files;
}

std::vector<Result> searchText(const WalkOptions& options, const std::string& needle) {
    std::vector<Result> results;
    std::string content;
    walkFiles(options, [&](const std::string& path) {
        content.clear();
        if (!readFile(path, content)) return;
        if (std::memchr(content.data(), '\0', std::min(content.size(), BINARY_SNIFF_BYTES))) return;

        Result result{path, {}, {}};
        findText(content, needle, result);
        if (!result.hits.empty()) results.push_back(std::move(result));
    });
    return results;
}
