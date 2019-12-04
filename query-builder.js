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
    
    let fileIds     = this.handleValue();
    let fileIdCount = fileIds.length;
    
    let singleEntity = fileIdCount === 1;
    let directory    = this.entityType === "directory";

    // All children one level deep for a directory
    if (id_query && singleEntity && directory && this.subdirectoryDepth == 1) {
      return this.buildSingleDirectoryContentOptions(fileIds[0]);

      // A single file
    } else if (singleEntity && !directory && !id_query) {
      return this.buildQueryForFileByName(fileIds[0]);
    }
  }

  buildSingleDirectoryContentOptions(fileId) {
    return `"${fileId}" in parents`;
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
      optParams: this.optParams
    };
  }
}

module.exports = {
  QueryBuilder: QueryBuilder
};
