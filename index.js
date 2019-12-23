const { superSearch } = require("./build/Release/superSearch.node");

const superSearchWrapper = (
  rootDir = `${process.cwd()}/fixtures`,
  query = "Lorem"
) => {
  const result = superSearch(rootDir, query);

  return result;
};

if (process.env.CLI) {
  console.log(superSearchWrapper());
}

module.exports = {
  superSearchWrapper
};
