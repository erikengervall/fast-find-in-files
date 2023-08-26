#pragma once

#include <vector>
#include <string>

struct QueryHit {
    std::string link;
    std::string line;
    int lineNumber;
    int offset;
};

struct Result {
    std::string filePath;
    int totalHits;
    std::vector<QueryHit> queryHits;
};

std::vector<Result> superSearch(std::string rootDirName, char const *userQuery, std::vector<std::string> excludePaths);