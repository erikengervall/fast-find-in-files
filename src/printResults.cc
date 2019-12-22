#include <iostream>
#include <vector>

#include "printResults.h"
#include "superSearch.h"

void printResults(std::vector<Result> &result) {
    // https://stackoverflow.com/questions/10750057/how-to-print-out-the-contents-of-a-vector
    for (auto i = result.begin(); i != result.end(); ++i) {
        Result fileOverview = *i;
        std::cout << "Filepath: " << fileOverview.filePath << std::endl;
        std::cout << "Total hits: " << fileOverview.totalHits << std::endl;

        for (auto i = fileOverview.allQueryHitDetails.begin();
             i != fileOverview.allQueryHitDetails.end(); ++i) {
            QueryHit queryHitDetails = *i;
            printf("> %s:%i\n", fileOverview.filePath.c_str(),
                   queryHitDetails.lineNumber);
        }
        std::cout << std::endl;
    }
}
