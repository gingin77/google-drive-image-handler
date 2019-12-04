const qb              = require("./query-builder");
const QueryBuilder    = qb.QueryBuilder;
const { listFiles }   = require("./queries");
const drh             = require("./response-handler")
const ResponseHandler = drh.ResponseHandler;

class GoogleDriveHandler {
  /**
   * @param { Object } inputArguments
   */
  constructor(inputArguments) {
    let queryObject = this.newQueryBuilder(inputArguments).queryObject;
    let { optParams, depth } = queryObject;

    this.optParams = optParams;
    this.depth = depth;
    this.inputArguments = inputArguments;
  }

  newQueryBuilder(inputArguments) {
    return new QueryBuilder(inputArguments);
  }

  async drivefiles() {
    return await listFiles(this.optParams);
  }

  async queryHandler() {
    let result = await this.getQueryResults();
    let count = result.length;

    return {
      result: result,
      count: count
    };
  }

  async getQueryResults() {
    let result = await this.drivefiles();

    if (this.depth > 1) {
      result = await this.getChildContents(result);
    }

    return result;
  }

  getArgumentsFromResponse(parentResult, localDepth) {
    let responseHandler = new ResponseHandler(parentResult, localDepth);
    return responseHandler.argumentsForNextDriveRequest;
  }

  async getChildContents(parentResult) {
    let localDepth = this.depth,
      nextArguments,
      nextOptParams;

    while (localDepth > 1) {
      nextArguments = this.getArgumentsFromResponse(parentResult, localDepth);
      nextOptParams = this.newQueryBuilder(nextArguments).optParams;
      
      parentResult = await listFiles(nextOptParams);
      localDepth   = nextArguments.subdirectoryDepth;
    }

    return parentResult;
  }
}

module.exports = {
  GoogleDriveHandler: GoogleDriveHandler
};