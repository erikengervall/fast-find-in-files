#include <iostream>
#include <vector>

#include "printResults.h"
#include "superSearch.h"

void printResults(std::vector<Result> &result) {
    // https://stackoverflow.com/questions/10750057/how-to-print-out-the-contents-of-a-vector
    for (auto i = result.begin(); i != result.end(); ++i) {
        Result result = *i;
        std::cout << "Filepath: " << result.filePath << std::endl;
        std::cout << "Total hits: " << result.totalHits << std::endl;

        for (auto i = result.queryHits.begin(); i != result.queryHits.end(); ++i) {
            QueryHit queryHit = *i;
            printf("> %s:%i:%i\n",
                   result.filePath.c_str(),
                   queryHit.lineNumber,
                   queryHit.offset);
        }
        std::cout << std::endl;
    }
}
