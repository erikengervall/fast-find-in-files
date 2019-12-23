const { superSearch } = require("./build/Release/superSearch.node");

const superSearchWrapper = (
  rootDir = `${process.cwd()}/fixtures`,
  query = "Lorem"
) => {
  const result = superSearch(rootDir, query);

  return result;
};

if (process.env.CLI) {
  console.log(JSON.stringify(superSearchWrapper(), null, 2));
}

module.exports = {
  superSearchWrapper
};
