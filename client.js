require("dotenv").config();

function googleDriveService() {
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
  
  return google.drive({ version: "v3", auth, timeout: 1000 });
}

module.exports = { googleDriveService };