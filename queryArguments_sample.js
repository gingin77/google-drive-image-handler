// Build query to list all contents of a directory starting from a Google Drive folder ID
let folder_queryArguments = {
  pageSize: 10,
  key: "id",
  value: "alpha-numeric-folder_id",
  entityType: "directory",
  subdirectoryDepth: 2,
  itemCount: 2,
  download: true,
  processImage: true
};

module.exports = folder_queryArguments;
