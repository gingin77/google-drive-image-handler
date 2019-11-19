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

module.exports = { listFiles };