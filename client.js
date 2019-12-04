require("dotenv").config();
const { google } = require("googleapis");

class GoogleDriveService {
  constructor() {
    this.keys = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    this.scope = ["https://www.googleapis.com/auth/drive"];
  }

  auth() {
    return new google.auth.JWT(
      this.keys.client_email,
      null,
      this.keys.private_key,
      this.scope,
      null
    );
  }

  driveOptions() {
    const auth = this.auth();
    return { version: "v3", auth, timeout: 5000 };
  }

  drive() {
    const options = this.driveOptions();
    
    return google.drive(options);
  }
}


module.exports = { GoogleDriveService: GoogleDriveService };