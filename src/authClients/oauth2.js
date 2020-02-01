const { google } = require("googleapis");

const SCOPES = ["https://www.googleapis.com/auth/drive.activity.readonly"];
const CREDENTIALS_PATH = "credentials.json";
const TOKEN_PATH = "token.json";

const fs = require("fs");
const util = require("util");
const readFilePromise = util.promisify(fs.readFile);
const readline = require("readline"); /* used to get new Token */

class GoogleDriveActivityClient {
  constructor() {
    this.scope = SCOPES;
    this.token_path = TOKEN_PATH;
  }

  async oAuth2Auth() {
    return readFilePromise(CREDENTIALS_PATH)
      .then(data => {
        const credentials = JSON.parse(data).installed;
        const { client_secret, client_id, redirect_uris } = credentials;

        return new google.auth.OAuth2(
          client_id,
          client_secret,
          redirect_uris[0]
        );
      })
      .catch(err => console.log(err));
  }

  async token(oAuth2) {
    const newTokenPromise = oAuth2Client => {
      return new Promise((res, rej) => {
        this.getNewToken(oAuth2Client, (data, err) => {
          if (err) return rej(err);
          res(data);
        });
      });
    };

    let token = await readFilePromise(TOKEN_PATH)
      .then(data => data)
      .catch(err => newTokenPromise(oAuth2));

    return token;
  }

  async oAuthWithToken() {
    const oAuth2 = await this.oAuth2Auth();
    const token = await this.token(oAuth2);
    oAuth2.setCredentials(JSON.parse(token));

    return oAuth2;
  }

  async activityService() {
    let oAuth2 = await this.oAuthWithToken();
    let service = google.driveactivity({ version: "v2", auth: oAuth2 });

    return service;
  }

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback for the authorized client.
   */
  getNewToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES
    });
    console.log("Authorize this app by visiting this url:", authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question("Enter the code from that page here: ", code => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error("Error retrieving access token", err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
          if (err) return console.error(err);
          console.log("Token stored to", TOKEN_PATH);
        });

        return oAuth2Client;
      });
    });
  }
  
}

module.exports = { GoogleDriveActivityClient: GoogleDriveActivityClient };
