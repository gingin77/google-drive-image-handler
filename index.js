const { googleDriveService } = require("./client");

const drive = googleDriveService();

function listFiles(optionParams) {
  return new Promise(resolve => {
    drive.files.list(optionParams, (listErr, res) => {
      if (listErr) {
        console.log(listErr);
        return;
      } else {
        resolve(res.data.files);
      }
    });
  });
}

let optionParams = {
  pageSize: 3,
  fields: "nextPageToken, files(id, name, mimeType)"
};

(async function queryHandler(optionParams) {
  let result = await listFiles(optionParams);
  console.log(result);
})(optionParams);