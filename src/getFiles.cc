#include <dirent.h>
#include <iostream>
#include <vector>

#include "constants.h"
#include "getFiles.h"
#include "superSearch.h"

bool isOSDir(char const *dirName) {
    bool isOSDirectory = std::strncmp(dirName, ".", 1) == 0 || std::strncmp(dirName, "..", 2) == 0;
    return isOSDirectory;
}

/**
 * Recursively search all sub-directories for files
 */
void getFiles(char const *directory, std::vector<std::string> &filePaths) {
    if (DEV)
        std::cout << "FN > getFiles(" << directory << ")\n";

    DIR *dir;
    struct dirent *ent;
    if ((dir = opendir(directory)) != NULL)  // http://man7.org/linux/man-pages/man3/opendir.3.html
    {
        while ((ent = readdir(dir)) != NULL) {
            if (isOSDir(ent->d_name)) {
                continue;
            }

            if (ent->d_type == DT_DIR) {
                std::string dirName = ent->d_name;
                std::string newDirectory = (std::string)directory + "/" + dirName;
                getFiles(newDirectory.c_str(), filePaths);
            } else {
                std::string fileName = ent->d_name;
                std::string filePath = (std::string)directory + "/" + fileName;
                filePaths.push_back(filePath);
            }
        }
        closedir(dir);
    } else {
        perror("ERROR > Failed to open directory");
        exit(EXIT_FAILURE);
    }
}