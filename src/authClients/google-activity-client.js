const { google }  = require("googleapis"),
  fs              = require("fs");
  readline        = require("readline"); /* used to get new Token */
  util            = require("util");
  readFilePromise = util.promisify(fs.readFile);

class GoogleActivityClient {
  constructor() {
    this.credentials_path = "credentials.json";
    this.scope            = ["https://www.googleapis.com/auth/drive.activity.readonly"];
    this.token_path       = "token.json";
  }

  async oAuth2Auth() {
    return readFilePromise(this.credentials_path)
      .then(data => {
        const { client_secret, client_id, redirect_uris } = JSON.parse(data).installed;

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

    let token = await readFilePromise(this.token_path)
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
    let oAuthWithToken = await this.oAuthWithToken();
    let service = google.driveactivity({ version: "v2", auth: oAuthWithToken });

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
      scope: this.scope
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

module.exports = { GoogleActivityClient: GoogleActivityClient };
