let optionParams = {
  pageSize: 4,
  q:
    '"alphanumeric-string-for-a-dir-on-google-drive" in parents or "alphanumeric-string-for-a-dir-on-google-drive" in parents',
  fields: "nextPageToken, files(id, name, mimeType)"
};

module.exports = optionParams;