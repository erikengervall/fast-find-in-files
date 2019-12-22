#include <dirent.h>
#include <fstream>
#include <iostream>
#include <vector>

#include "constants.h"
#include "queryFile.h"
#include "superSearch.h"

void queryFile(std::string filePath, char const *query, std::vector<Result> &result) {
    std::ifstream fileStream;
    fileStream.open(filePath.c_str());

    if (!fileStream.is_open()) {
        std::cout << "Unable to open file: " << filePath;
        exit(EXIT_FAILURE);
    }

    std::vector<QueryHit> allQueryHitDetails;
    Result fileOverview = {filePath, 0, allQueryHitDetails};

    int lineNumber = 0;
    int offset;
    std::string line;

    while (getline(fileStream, line)) {
        lineNumber++;
        if ((offset = line.find(query, 0)) != std::string::npos) {
            // std::string notSuperLongLine = line.substr(0, 10);
            QueryHit queryHitDetails = {line, lineNumber, offset};
            fileOverview.totalHits++;
            fileOverview.allQueryHitDetails.push_back(queryHitDetails);

            if (DEV)
                std::cout << "found: " << offset << " -- " << line.substr(0, 10)
                          << std::endl;
        }
    }

    fileStream.close();
    result.push_back(fileOverview);
}