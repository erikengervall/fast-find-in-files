#include <iostream>
#include <dirent.h>
#include <vector>
#include <filesystem>
#include <fstream>

using namespace std;

bool DEBUG = false;

struct QueryHitDetails
{
    int lineNumber;
    int offset;
    string line;
};

struct FileOverview
{
    string filePath;
    int totalHits;
    vector<QueryHitDetails> allQueryHitDetails;
};

void queryFile(string filePath, char const *query, vector<FileOverview> &finalResults)
{
    ifstream fileStream;
    fileStream.open(filePath.c_str());

    if (!fileStream.is_open())
    {
        cout << "Unable to open file: " << filePath;
        exit(EXIT_FAILURE);
    }

    vector<QueryHitDetails> allQueryHitDetails;
    FileOverview fileOverview = {filePath, 0, allQueryHitDetails};

    int lineNumber = 0;
    int offset;
    string line;

    while (getline(fileStream, line))
    {
        lineNumber++;
        if ((offset = line.find(query, 0)) != string::npos)
        {
            string notSuperLongLine = line.substr(0, 10);
            QueryHitDetails queryHitDetails = {lineNumber, offset, notSuperLongLine};
            fileOverview.totalHits++;
            fileOverview.allQueryHitDetails.push_back(queryHitDetails);

            if (DEBUG)
                cout << "found: " << offset << " -- " << line.substr(0, 10) << endl;
        }
    }

    fileStream.close();
    finalResults.push_back(fileOverview);
}

void getFiles(char const *directory, vector<string> &filePaths)
{
    if (DEBUG)
        cout << "FN > getFiles(" << directory << ")\n";

    DIR *dir;
    struct dirent *ent;
    if ((dir = opendir(directory)) != NULL) // http://man7.org/linux/man-pages/man3/opendir.3.html
    {
        while ((ent = readdir(dir)) != NULL)
        {

            if (strncmp(ent->d_name, ".", 1) == 0 || strncmp(ent->d_name, "..", 2) == 0)
            {
                continue;
            }

            if (ent->d_type == DT_DIR)
            {
                string dirName = ent->d_name;
                string newDirectory = (string)directory + "/" + dirName;
                getFiles(newDirectory.c_str(), filePaths);
            }
            else
            {
                string fileName = ent->d_name;
                string filePath = (string)directory + "/" + fileName;
                filePaths.push_back(filePath);
            }
        }
        closedir(dir);
    }
    else
    {
        perror("ERROR > Failed to open directory");
        exit(EXIT_FAILURE);
    }
}

void printResults(vector<FileOverview> &finalResults)
{
    for (auto i = finalResults.begin(); i != finalResults.end(); ++i) // https://stackoverflow.com/questions/10750057/how-to-print-out-the-contents-of-a-vector
    {
        FileOverview fileOverview = *i;
        cout << "Filepath: " << fileOverview.filePath << endl;
        cout << "Total hits: " << fileOverview.totalHits << endl;
        for (auto i = fileOverview.allQueryHitDetails.begin(); i != fileOverview.allQueryHitDetails.end(); ++i) // https://stackoverflow.com/questions/10750057/how-to-print-out-the-contents-of-a-vector
        {
            QueryHitDetails queryHitDetails = *i;
            printf("> %s:%i\n", fileOverview.filePath.c_str(), queryHitDetails.lineNumber);
        }
        cout << endl;
    }
}

int main(int argc, char **argv)
{
    const char *userQuery = "Lorem ipsum";
    string userInputDirectory = "level0";
    string strDirectory = (string)filesystem::current_path() + "/" + userInputDirectory;

    vector<string> filePaths;
    getFiles(strDirectory.c_str(), filePaths);
    vector<FileOverview> finalResults;

    for (auto i = filePaths.begin(); i != filePaths.end(); ++i) // https://stackoverflow.com/questions/10750057/how-to-print-out-the-contents-of-a-vector
    {
        if (DEBUG)
            cout << "RES > " << *i << ' ' << endl;
        queryFile(*i, userQuery, finalResults);
    }

    printResults(finalResults);

    return 0;
}
