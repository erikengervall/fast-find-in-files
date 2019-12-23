#pragma once

#include <string>

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

std::vector<Result> superSearch(std::string rootDirName, char const *userQuery);
