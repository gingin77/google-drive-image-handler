require("dotenv").config();
const keys = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
const { google } = require("googleapis");
const scope = ["https://www.googleapis.com/auth/drive"];
const auth = new google.auth.JWT(
  keys.client_email,
  null,
  keys.private_key,
  scope,
  null
);
const drive = google.drive({ version: "v3", auth });

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