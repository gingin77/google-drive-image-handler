const qb = require("./query-builder"),
  QueryBuilder = qb.QueryBuilder,
  dq = require("./queries"),
  DriveQuery = dq.DriveQuery,
  rh = require("./response-handler"),
  ResponseHandler = rh.ResponseHandler;

class GoogleDriveHandler {
  /**
   * @param { Object } inputArguments
   */
  constructor(inputArguments, drive) {
    let queryObject = this.newQueryBuilder(inputArguments).queryObject;
    let { optParams, depth } = queryObject;

    this.drive = drive;
    this.optParams = optParams;
    this.depth = depth;
    this.inputArguments = inputArguments;
  }

  newQueryBuilder(inputArguments) {
    return new QueryBuilder(inputArguments);
  }

  async drivefiles(optParams = null) {
    optParams = !optParams ? this.optParams : optParams;
    let dq = new DriveQuery(optParams, this.drive);

    return await dq.filesList;
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

      parentResult = await this.drivefiles(nextOptParams);
      localDepth = nextArguments.subdirectoryDepth;
    }

    return parentResult;
  }
}

const gds = require("./client"),
  driveService = new gds.GoogleDriveService(),
  drive = driveService.drive(),
  inputArguments = require("./scratch/queryArguments"),
  googleDriveHandler = new GoogleDriveHandler(inputArguments, drive);

googleDriveHandler.queryHandler().then(console.log);

module.exports = {
  GoogleDriveHandler: GoogleDriveHandler
};
