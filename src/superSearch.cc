#include <iostream>
#include <vector>

#include "constants.h"
#include "getFiles.h"
#include "printResults.h"
#include "queryFile.h"
#include "superSearch.h"

std::vector<Result> superSearch(std::string rootDirName, char const *userQuery, std::vector<std::string> excludeFolderPaths = {}) {
    std::vector<std::string> filePaths;
    getFiles(rootDirName.c_str(), filePaths, excludeFolderPaths);
    std::vector<Result> result;

    // https://stackoverflow.com/questions/10750057/how-to-print-out-the-contents-of-a-vector
    for (auto i = filePaths.begin(); i != filePaths.end(); ++i) {
        if (DEV) std::cout << "RES > " << *i << ' ' << std::endl;
        queryFile(*i, userQuery, result);
    }

    if (DEV) printResults(result);

    return result;
}
