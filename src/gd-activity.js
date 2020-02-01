const gac = require("./authClients/google-activity-client"),
  GoogleActivityClient = gac.GoogleActivityClient,
  params = require("../google-drive-details/activity-api/params");

async function getGdActivityServer() {
  let client = new GoogleActivityClient();
  let service = await client.activityService();

  return service;
}

/**
 * Lists activity in your Google Drive.
 *
 * @param params defines the query params used to filter activities returned
 */
async function listDriveActivity(params) {
  const service = await getGdActivityServer()

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

listDriveActivity(params);