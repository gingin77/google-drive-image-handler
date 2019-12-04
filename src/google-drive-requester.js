class GoogleDriveRequester {
  constructor(optParams, drive) {
    this.optParams = optParams;
    this.drive = drive;
  }

  get filesList() {
    return new Promise(resolve => {
      this.drive.files.list(this.optParams, (listErr, res) => {
        if (listErr) {
          console.log(listErr);
          return;
        } else {
          resolve(res.data.files);
        }
      });
    });
  }
}

module.exports = {
  GoogleDriveRequester: GoogleDriveRequester
};
