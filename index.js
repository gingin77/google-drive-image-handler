const { listFiles } = require("./queries");
const optionParams  = require("./scratch/optionParams");

let optionParams = {
  pageSize: 3,
  fields: "nextPageToken, files(id, name, mimeType)"
};

(async function queryHandler(optionParams) {
  let result = await listFiles(optionParams);
  console.log(result);
})(optionParams);