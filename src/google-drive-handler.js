const qb = require("./query-builder"),
  QueryBuilder = qb.QueryBuilder,
  dq = require("./google-drive-requester"),
  GoogleDriveListRequester = dq.GoogleDriveListRequester,
  dd = require("./google-drive-downloader"),
  GoogleDriveDownloader = dd.GoogleDriveDownloader,
  rh = require("./response-handler"),
  ResponseHandler = rh.ResponseHandler,
  fs = require('fs'),
  path = require('path'),
  os = require('os'),
  moment = require('moment');

class GoogleDriveHandler {
  /**
   * @param { Object } inputArguments
   */
  constructor(inputArguments, drive) {
    let queryObject = this.newQueryBuilder(inputArguments).queryObject;
    let { optParams, depth, itemCount, download, processImage } = queryObject;

    this.drive = drive;
    this.optParams = optParams;
    this.depth = depth;
    this.itemCount = itemCount;
    this.download = download;
    this.processImage = processImage;
    this.inputArguments = inputArguments;
  }

  newQueryBuilder(inputArguments) {
    return new QueryBuilder(inputArguments);
  }

  async queryHandler() {
    let result = await this.getQueryResults();
    let count = result.length;

    let listResult = {
      result: result,
      count: count,
      downloads_complete: false
    };

    if (!this.download) {
      return listResult;
    } else {
      let downloads = await this.downloadResults(result);
      let complete =
        downloads.every(item => item == "Success!") &&
        downloads.length == result.length;
      listResult = Object.assign({}, listResult, {
        downloads_complete: complete
      });

      return listResult;
    }
  }

  async writeFileNamesToTsv() {
    let listResult = await this.queryHandler();
    let timestamp = moment().format("MM-DD-YYYY_HH:mm");
    const filename = path.join("__dirname", `../results_${timestamp}.tsv`);
    const output = [];

    listResult.result.forEach(obj => {
      const row = [];
      row.push(obj.name);
      row.push(obj.id);

      output.push(row.join("\t"));
    });

    fs.writeFileSync(filename, output.join(os.EOL));
  }

  async getQueryResults() {
    let result = await this.drivefiles();

    if (this.depth > 1) {
      result = await this.getChildContents(result);
    }

    return result;
  }

  async drivefiles(optParams = null) {
    optParams = !optParams ? this.optParams : optParams;
    let gdlr = new GoogleDriveListRequester(optParams, this.drive);

    return await gdlr.filesList;
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

  getArgumentsFromResponse(parentResult, localDepth) {
    let responseHandler = new ResponseHandler(
      parentResult,
      localDepth,
      this.itemCount
    );
    return responseHandler.argumentsForNextDriveRequest;
  }

  async downloadResults(result) {
    let downloadPromises = result.map(item => {
      let gdd = new GoogleDriveDownloader(this.drive, item, this.processImage);
      return gdd.fileDownload();
    });

    return Promise.all(downloadPromises).then(results => {
      return results;
    });
  }
}

module.exports = {
  GoogleDriveHandler: GoogleDriveHandler
};

const gds = require("./authClients/google-drive-client"),
  driveClient = new gds.GoogleDriveClient(),
  drive = driveClient.drive(),
  inputArguments = require("../scratch/queryArguments"),
  googleDriveHandler = new GoogleDriveHandler(inputArguments, drive);

googleDriveHandler.queryHandler().then(console.log);