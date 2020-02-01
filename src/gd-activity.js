/** The following is a customization of the Node.js Activity API quick start
 * https://developers.google.com/drive/activity/v2/quickstart/nodejs
 * 
 * In addition to modifying the logged output, I'm customizing the query params
 * To customize the params, I've added params as a third argument passed to 
 * authorize, along with the callback function
 */ 

const fs = require("fs");
const util = require("util");
const readline = require("readline");
const readFilePromise = util.promisify(fs.readFile);
const { google } = require("googleapis");
const params = require("../google-drive-details/activity-api/params");

const SCOPES = ["https://www.googleapis.com/auth/drive.activity.readonly"];
const TOKEN_PATH = "token.json";

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
async function authorize(callback, params) {
  let credentials = await readFilePromise("./credentials.json")
    .then(data => JSON.parse(data))
    .catch(err => console.log(err));

  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have previously stored a token.
  let token = await readFilePromise(TOKEN_PATH)
    .then(data => data)
    .catch(err => newTokenPromise(oAuth2Client));

  oAuth2Client.setCredentials(JSON.parse(token));
  callback(oAuth2Client, params);
}

/**
 * Lists the recent activity in your Google Drive.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listDriveActivity(auth, params) {
  // const auth = await authorize()
  //   .then(data => data)
  //   .catch(err => console.log(err));
  
  const service = google.driveactivity({ version: "v2", auth });


  service.activity.query({ requestBody: params }, (err, res) => {
    if (err) return console.error("The API returned an error: " + err);
    const activities = res.data.activities;
    
    if (activities) {
      console.log("Activity count:");
      console.log(activities.length);

      activities.forEach(activity => {
        const time = getTimeInfo(activity);
        const action = getActionInfo(activity.primaryActionDetail);
        
        const targets = activity.targets.map(getTargetInfo);
        if (action == "move") {
          const originalName = (targets[0].replace('driveItem:"',"")).replace("\"", "");
          if (activity.primaryActionDetail["move"] !== undefined) {
            const newParent = getNewParentName(activity);

            console.log(`The new parent is ${newParent}`);
            console.log(`${time}: ${action}, ${originalName}\n`);
          }
          
        }
      });
    } else {
      console.log("No activity.");
    }
  });
}
authorize(listDriveActivity, params);
// listDriveActivity(params);

/**
 * Returns the name of a set property in an object, or else "unknown".
 *
 * @param {Object} object The object in which to find the set property.
 * @return {string}
 */
function getOneOf(object) {
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      return key;
    }
  }
  return "unknown";
}

/**
 * Returns a time associated with an activity.
 *
 * @param {Object} activity The DriveActivity from which to extract a time.
 * @return {string}
 */
function getTimeInfo(activity) {
  if ("timestamp" in activity) {
    return activity.timestamp;
  }
  if ("timeRange" in activity) {
    return activity.timeRange.endTime;
  }
  return "unknown";
}

/**
 * Returns the type of action.
 *
 * @param {Object} actionDetail The ActionDetail to summarize.
 * @return {string}
 */
function getActionInfo(actionDetail) {
  return getOneOf(actionDetail);
}

/**
 * Returns the type of a target and an associated title.
 *
 * @param {Object} target The Target to summarize.
 * @return {string}
 */
function getTargetInfo(target) {
  if ("driveItem" in target) {
    const title = target.driveItem.title || "unknown";
    return `driveItem:"${title}"`;
  }
  if ("drive" in target) {
    const title = target.drive.title || "unknown";
    return `drive:"${title}"`;
  }
  if ("fileComment" in target) {
    const parent = target.fileComment.parent || {};
    const title = parent.title || "unknown";
    return `fileComment:"${title}"`;
  }
  return `${getOneOf(target)}:unknown`;
}

/**
 * Returns a string representing the drive location of a new parent folder for
 * a moved item
 *
 * @param {Object} activity The DriveActivity from which to extract details
 * @return {string}
 */
function getNewParentName(activity) {
  const firstAddedParent = activity.primaryActionDetail["move"]["addedParents"][0];
  
  return firstAddedParent["driveItem"]["name"];
}

const newTokenPromise = oAuth2Client => {
  return new Promise((res, rej) => {
    getNewToken(oAuth2Client, (data, err) => {
      if (err) return rej(err);
      res(data);
    });
  });
};


/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client) {
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

