const chai = require("chai"),
  expect = chai.expect,
  gdc = require("../../src/google-drive-client"),
  driveClient = new gdc.GoogleDriveClient(),
  drive = driveClient.drive(),
  gdh = require("../../src/google-drive-handler"),
  GoogleDriveHandler = gdh.GoogleDriveHandler,
  { i, o } = require("../fixtures/google-drive-handler.js");

function getNewGoogleDriveHandler(inputArguments, drive) {
  return new GoogleDriveHandler(
      inputArguments,
      drive
  );
}

describe("GoogleDriveHandler", () => {
  describe("results returned", ()=> {
    context("when directory query with depth of one", () => {
      it("should return direct child contents, which are usually also folders", async () => {
        let googleDriveHandler = getNewGoogleDriveHandler(
          i.singleDirectoryDepthOne,
          drive
        );
        const data = await googleDriveHandler.queryHandler();

        expect(data.result).to.eql(o.singleDirectoryDepthOne);
      });
    });

    context("when directory query with depth of two", () => {
      it("should return child contents of subdirectory, which are usually media files", async () => {
        let googleDriveHandler = getNewGoogleDriveHandler(
          i.singleDirectoryDepthTwo,
          drive
        );
        const data = await googleDriveHandler.queryHandler();

        expect(data.result).to.eql(o.singleDirectoryDepthTwo);
      });
    })

  })
});