const fs = require("fs"),
  path = require("path"),
  sharp = require("sharp");

class ImageProcessor {
  constructor(responseObject, filePath) {
    this.responseObject = responseObject;
    this.filePath = filePath;
    this.isImage = this.filterImages(responseObject);
  }

  getStreams(fileName) {
    const filePath = path.join("./tmp", fileName);
    const outputPath = path.join("./tmp/resized", fileName);

    return {
      readStream: fs.createReadStream(filePath),
      writeStream: fs.createWriteStream(outputPath)
    };
  }

  processImage() {
    if (!this.isImage) {
      return false;
    }
    const { name } = this.responseObject;
    const { readStream, writeStream } = this.getStreams(name);

    const pipeline = sharp()
      .rotate()
      .resize(400, 400);

    readStream.pipe(pipeline).pipe(writeStream);
  }

  filterImages(item) {
    let re = /image\/jpeg|image\/png/;
    if (item.mimeType.match(re)) {
      return true;
    }
  }
}

module.exports = {
  ImageProcessor: ImageProcessor
};
