'use strict'

const config = require(process.cwd() + '/config/default')
const sftpClient = require('ssh2-sftp-client');
const fs = require('fs');

function uploadFile(config, fileName) {
  let data = fs.createReadStream(fileName);
  let sftp = new sftpClient();
  let remote = `${config.ftp_test.rootPath}/${fileName}`;
  sftp.connect(config.ftp_test)
    .then(() => {
      return sftp.put(data, remote);
    })
    .then(() => {
      return sftp.end();
    })
    .catch(err => {
      console.error(err.message);
    });

}

function listRemoteFiles(config) {
  let sftp = new sftpClient();
  sftp.connect(config.ftp_test).then(() => {
    return sftp.list(config.ftp_test.rootPath);
  }).then(data => {
    console.log(data, 'the data info');
  }).catch(err => {
    console.log(err, 'catch error');
  });
}

function upload(params) {
  const fileName = 'foo.txt'
  uploadFile(config, fileName)
  listRemoteFiles(config)
}

module.exports = {
  upload
}
