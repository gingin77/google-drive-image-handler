const { listFiles } = require("./queries");
const optionParams  = require("./scratch/optionParams");

(async function queryHandler(optionParams) {
  let result = await listFiles(optionParams);
  console.log(result);
})(optionParams);