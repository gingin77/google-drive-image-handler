const chai = require("chai"),
  expect = chai.expect,
  gdc = require("../../src/authClients/google-drive-client"),
  driveClient = new gdc.GoogleDriveClient(),
  drive = driveClient.drive(),
  gdh = require("../../src/google-drive-handler"),
  GoogleDriveHandler = gdh.GoogleDriveHandler,
  {
    i,
    o
  } = require("../../google-drive-details/test/fixtures/google-drive-handler.js");

function getNewGoogleDriveHandler(inputArguments, drive) {
  return new GoogleDriveHandler(inputArguments, drive);
}

describe("GoogleDriveHandler", () => {
  describe("results returned", () => {
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
    });

    context("when depth is two, item count is 2, and directory query", () => {
      it("should return 2 child objects from a subdirectory", async () => {
        let googleDriveHandler = getNewGoogleDriveHandler(
          i.singleDirectoryDepthTwoItemCountTwo,
          drive
        );
        const data = await googleDriveHandler.queryHandler();

        expect(data.count).to.eql(2);
        expect(data.result).to.have.lengthOf(2);
      });
    });
  });

  describe("allows download option", () => {
    context("when download: true is passed in arguments" , () => {
      let googleDriveHandler = getNewGoogleDriveHandler(
        i.downloadTrue,
        drive
      );
      it("records that results have been downloaded", async () => {
        const data = await googleDriveHandler.queryHandler();

        expect(data.downloads_complete).to.be.true;
      })
    })

    context("when download flag is NOT passed in arguments", () => {
      let googleDriveHandler = getNewGoogleDriveHandler(
        i.singleDirectoryDepthTwoItemCountTwo,
        drive
      );
      it("indicates false for downloads_complete", async () => {
        const data = await googleDriveHandler.queryHandler();

        expect(data.downloads_complete).to.be.false;
      });
    });

    context("when download: false is passed in arguments", () => {
      let googleDriveHandler = getNewGoogleDriveHandler(
        i.downloadFalse,
        drive
      );
      it("indicates false for downloads_complete", async () => {
        const data = await googleDriveHandler.queryHandler();

        expect(data.downloads_complete).to.be.false;
      });
    });
  });
});
