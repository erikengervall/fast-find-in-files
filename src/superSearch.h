#pragma once

#include <string>

std::string superSearch(std::string rootDirName, char const *userQuery);

struct QueryHit {
    std::string line;
    int lineNumber;
    int offset;
};

struct Result {
    std::string filePath;
    int totalHits;
    std::vector<QueryHit> queryHits;
};
