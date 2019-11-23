const queryArguments = require("./scratch/queryArguments");
const qb             = require("./query-builder");
const QueryBuilder   = qb.QueryBuilder;
const queryBuilder   = new QueryBuilder(queryArguments);
const optionParams   = queryBuilder.optParams;
const { listFiles } = require("./queries");

(async function queryHandler(optionParams) {
  let result = await listFiles(optionParams);
  console.log(result);
})(optionParams);