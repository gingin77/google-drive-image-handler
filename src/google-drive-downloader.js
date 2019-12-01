const fs = require("fs"),
  path = require("path"),
  sharp = require("sharp"),
  gds = require("./google-drive-client"),
  driveClient = new gds.GoogleDriveClient(),
  drive = driveClient.drive();

class GoogleDriveDownloader {
  constructor(drive, responseObject, processImage) {
    this.drive = drive;
    this.responseObject = responseObject;
    this.processImage = processImage;
  }

  fileDownload() {
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
                if(this.processImage) {
                  this.fileCompress(filePath);
                }
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
          });
        });
    });

    return download;
  }

  fileCompress() {
    const { id, name } = this.responseObject;
    const filePath = path.join("./tmp", name);
    let readStream = fs.createReadStream(filePath);
    const outputPath = path.join("./tmp/resized", name);
    const writeStream = fs.createWriteStream(outputPath);

    const pipeline = sharp()
      .rotate()
      .resize(200, 200)
      .toBuffer(function(err, outputBuffer, info) {
        // outputBuffer contains 200px high JPEG image data,
        // auto-rotated using EXIF Orientation tag
        // info.width and info.height contain the dimensions of the resized image
      });
      // .metadata()
      // .then(metadata => {
      //   console.log("metadata");
      //   console.log(metadata);
      // });

    readStream.pipe(pipeline).pipe(writeStream);
  }
}

module.exports = {
  GoogleDriveDownloader: GoogleDriveDownloader
};
