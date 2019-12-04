const fs = require("fs"),
  path = require('path'),
  gds = require("./google-drive-client"),
  driveClient = new gds.GoogleDriveClient(),
  drive = driveClient.drive();

class GoogleDriveDownloader {
  constructor(drive, responseObject) {
    this.drive = drive;
    this.responseObject = responseObject;
  }

  get fileDownload() {
    let drive = this.drive;
    let { id, name } = this.responseObject;
    let download = new Promise(outerResolve => {
      drive.files
        .get({ fileId: id, alt: "media" }, { responseType: "stream" })
        .then(res => {
          new Promise((resolve, reject) => {
            const filePath = path.join("./tmp", name);
            console.log(`\nwriting to ${filePath}\n`);
            const dest = fs.createWriteStream(filePath);
            let progress = 0;

            res.data
              .on("end", () => {
                console.log("\nDone downloading file.\n");
                resolve(filePath);
                outerResolve("Success!");
              })
              .on("error", err => {
                console.error("Error downloading file.\n");
                reject(err);
              })
              .on("data", d => {
                progress += d.length;
                if (process.stdout.isTTY) {
                  process.stdout.clearLine();
                  process.stdout.cursorTo(0);
                  process.stdout.write(`Downloaded ${progress} bytes`);
                }
              })
              .pipe(dest);
          })
        })
    });

    return download;
  }
}

module.exports = {
  GoogleDriveDownloader: GoogleDriveDownloader
};
