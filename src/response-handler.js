class ResponseHandler {
  constructor(result, depth, itemCount ) {
    this.depth = depth;
    this.itemCount = itemCount;
    this.result = result;
    this.entityType = this.depth > 1 ? "directory" : "file";
  }

  get argumentsForNextDriveRequest() {
    let ids = this.idsFromRequest;
    let pageSize = this.determinePageSize(ids);

    return {
      pageSize: pageSize,
      key: "id",
      value: ids,
      entityType: this.entityType,
      itemCount: this.itemCount,
      subdirectoryDepth: this.depthForNextGoogleDriveRequest(),
      searchBoolean: "or"
    };
  }

  determinePageSize(ids) {
    let nextDepth = this.depthForNextGoogleDriveRequest();

    if (nextDepth == 1) {
      return this.itemCount;
    } else {
      return 10 * this.idsCount(ids);
    }
  }

  /**
   * @param { Array<String> } ids
   */
  idsCount(ids) {
    let idsCount;
    if (Array.isArray(ids) && ids.length) {
      idsCount = ids.length;
    }

    return idsCount ? idsCount : 1;
  }

  get idsFromRequest() {
    if (this.depth > 1) {
      return this.getFolderIdsFromResult(this.result);
    } else if (this.depth == 1) {
      return this.getJpegAndPngIdsFromResult(this.result);
    }
  }

  depthForNextGoogleDriveRequest() {
    let currentDepth = this.depth;
    
    return --currentDepth;
  }

  getFolderIdsFromResult(result) {
    let filteredResult = result
      .map(res => {
        if (res.mimeType == "application/vnd.google-apps.folder") {
          return res.id;
        }
      })
      .filter(item => !!item);

    return Array.from(filteredResult);
  }

  getJpegAndPngIdsFromResult(result) {
    // define regex for jpeg and png image formats
    let re = /image\/jpeg|image\/png/;
    let mediaResult = this.getMediaFileObjectsFromResult(result);

    return mediaResult
      .map(item => {
        if (item.mimeType.match(re)) {
          return item.id;
        }
      })
      .filter(item => !!item);
  }

  getMediaFileObjectsFromResult(result) {
    // define regex for video and image formats
    let re = /video\/(\w*)|image\/(\w*)/;
    
    return Array.from(result
      .map(item => {
        if (item.mimeType.match(re)) {
          return item;
        }
      })
      .filter(item => !!item)
    );
  }
}

module.exports = {
  ResponseHandler: ResponseHandler
};