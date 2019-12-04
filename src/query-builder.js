class QueryBuilder {
  // key specifies whether the value is a "name" or "id"
  // value can be a "name" or "id" for a folder or single file; 'value' can accept strings or arrays
  // entityType indicates whether "value" is expected to be a "file" or a "directory"
  // searchBoolean should be passed: "or", "and", OR "not"
  // subdirectoryDepth is ignored if entityType == file
  // itemCount is the number of items passed back in list when subdirectory depth is greater than one
  constructor({ pageSize, key, value, entityType, subdirectoryDepth, searchBoolean, itemCount}) {
    this.pageSize          = pageSize;
    this.key               = key;
    this.value             = value;
    this.entityType        = entityType;
    this.subdirectoryDepth = subdirectoryDepth;
    this.searchBoolean     = searchBoolean;
    this.itemCount         = itemCount;
    this.fields            = "nextPageToken, files(id, name, mimeType)";
  }
  get queryString() {
    let id_query = this.key === "id";

    let fileIds     = this.handleValue();
    let fileIdCount = fileIds.length;

    let singleEntity = fileIdCount === 1;
    let directory    = this.entityType === "directory";

    // All children one level deep for a directory
    if (id_query && singleEntity && directory) {
      return this.buildQueryForSingleDirectory(fileIds[0]);

      // A single file
    } else if (singleEntity && !directory && !id_query) {
      return this.buildQueryForFileByName(fileIds[0]);

      // Multiple directory ids
    } else if (id_query && !singleEntity && directory) {
      return this.buildQueryForMultiDirectories(fileIds);
    }

  }

  buildQueryForSingleDirectory(fileId) {
    return `"${fileId}" in parents`;
  }

  buildQueryForMultiDirectories(fileIds) {
    return fileIds
      .map(id => {
        return this.buildQueryForSingleDirectory(id);
      })
      .join(` ${this.searchBoolean} `);
  }

  buildQueryForFileByName(fileId) {
    return `name contains "${fileId}"`;
  }

  handleValue() {
    if (typeof this.value === "string") {
      return this.processStringValue();
    } else if (Array.isArray(this.value)) {
      return this.value;
    }
  }

  processStringValue() {
    let inputSplit = this.value.split(",");

    if (inputSplit.length > 1) {
      inputSplit = inputSplit.map(s => s.trim());
    }

    return inputSplit;
  }

  get optParams() {
    return {
      pageSize: this.pageSize,
      q: this.queryString,
      fields: this.fields
    };
  }

  get queryObject() {
    return {
      optParams: this.optParams,
      depth: this.subdirectoryDepth,
      itemCount: this.itemCount
    };
  }
}

module.exports = {
  QueryBuilder: QueryBuilder
};
