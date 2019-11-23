class QueryBuilder {
  // key specifies whether the value is a "name" or "id"
  // value can be a "name" or "id" for a folder or single file; 'value' can accept strings or arrays
  // entityType indicates whether "value" is expected to be a "file" or a "directory"
  // subdirectoryDepth is ignored if entityType == file
  constructor({ pageSize, key, value, entityType, subdirectoryDepth, fields }) {
    this.pageSize          = pageSize;
    this.key               = key;
    this.value             = value;
    this.entityType        = entityType;
    this.subdirectoryDepth = subdirectoryDepth;
    this.fields            = fields;
  }

  get queryString() {
    let id_query = this.key === "id";
    let { fileIds, fileIdCount } = this.handleValue();
    let singleEntity = fileIdCount === 1;
    let directory = this.entityType === "directory";

    if (id_query && singleEntity && directory && this.subdirectoryDepth == 1) {
      return this.buildSingleDirectoryContentOptions(fileIds[0]);
    }
  }

  handleValue() {
    let fileIds, fileIdCount;

    if (typeof this.value == "string") {
      let input = this.value;
      let inputSplit = input.split(",");
      fileIdCount = inputSplit.length;
      if (fileIdCount > 1) {
        inputSplit.map(s => s.trim());
      }
      fileIds = inputSplit;
    } else if (typeof this.value == "array") {
      fileIds = this.value;
      fileIdCount = this.fileIdInput.length;
    }

    return {
      fileIds:     fileIds,
      fileIdCount: fileIdCount
    };
  }

  buildSingleDirectoryContentOptions(fileId) {
    return `"${fileId}" in parents`;
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
      optParams: this.optParams
    };
  }
}

module.exports = {
  QueryBuilder: QueryBuilder
};
