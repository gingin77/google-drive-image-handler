const chai = require("chai"),
  expect = chai.expect,
  nQb = require("../../response-handler"),
  ResponseHandler = nQb.ResponseHandler,
  { responeInput } = require("../fixtures/response-handler.js");

function init(parent, depth) {
  return new ResponseHandler(parent, depth);
}

describe("ResponseHandler", () => {
  let responseHandler = init(responeInput, 1);
  let idsFromInputResult = responeInput.map(obj => obj.id);

  describe("Result Ids", () => {
    it("should be an array", () => {
      expect(responseHandler.idsFromRequest).to.be.an("array");
    });
    it("should contain ids from parent result argument", () => {
      expect(idsFromInputResult).to.include.members(
        responseHandler.idsFromRequest
      );
    });

    let idsFolderMimeType = responeInput
      .filter(obj => obj.mimeType === "application/vnd.google-apps.folder")
      .map(obj => obj.id);

    let idsForImageMimeType = responeInput
      .filter(obj => obj.mimeType === "image/jpeg")
      .map(obj => obj.id);
    
    context("when depth argument is 1", () => {
      it("should not include ids with the folder mime/Type", () => {
        expect(responseHandler.idsFromRequest).to.include.members(
          idsForImageMimeType
        );
        expect(responseHandler.idsFromRequest).to.not.include.members(
          idsFolderMimeType
        );
      });
    });

    context("when depth argument is 2", () => {
      let responseHandler = init(responeInput, 2);
      
      it("should only include ids with the folder mime/Type", () => {
        expect(responseHandler.idsFromRequest).to.include.members(
          idsFolderMimeType
        );
        expect(responseHandler.idsFromRequest).to.not.include.members(
          idsForImageMimeType
        );
      });
    });
  });
});
