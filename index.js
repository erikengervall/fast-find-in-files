const superSearchModule = require("./build/Release/superSearch.node");

const rootDir = `${process.cwd()}/fixtures`;
const query = "Lorem";

const result = superSearchModule.superSearch(rootDir, query);

console.log(result);
