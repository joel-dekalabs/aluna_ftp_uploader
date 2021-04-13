'use strict'
const projectPath = `${process.cwd()}`
const config = require(projectPath + '/config/default')
const sftpClient = require('ssh2-sftp-client')
const http = require('http')
const fs = require('fs')

const defaultMediaProtocol = 'http://'
const validStatusCode = 200

function uploadFile(config, fullFileName, fileName) {
  const ftpUploadOk = true
  const data = fs.createReadStream(fullFileName)
  const sftp = new sftpClient()
  const remote = `${config.ftp_test.rootPath}/${fileName}`
  sftp.connect(config.ftp_test).then(() => {
    return sftp.put(data, remote)
  }).then(() => {
    return sftp.end()
  }).catch(err => {
    console.error(err.message)
    return !ftpUploadOk
  })

  return ftpUploadOk
}

function createMediaDir(config) {
  const dir = config && config.mediaOptions && config.mediaOptions.path ? config.mediaOptions.path : `${projectPath}/media`
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir)
  }

  console.log(`Directory ${dir} ok`)
  return dir
}

function mediaDownload(url, fullFileName, cb) {
  let processOk = true
  const file = fs.createWriteStream(fullFileName)
  http.get(url, (response) => {
    if (response.statusCode === validStatusCode) {
      response.pipe(file)
      file.on('finish', () => {
        console.log(`File ${url} downloaded succesfully: HTTP STATUS CODE ${response.statusCode}`)
        file.close(cb(processOk))
      })
    } else {
      console.log(`Error performing request: HTTP STATUS CODE ${response.statusCode}`)
      cb(!processOk)
    }
  }).on('error', (err) => { 
    fs.unlink(fullFileName)
    if (cb) { 
      console.log(`Error downloading file: ${err.message}`)
      cb(!processOk)
    }
  })
}

function validateUrl(config, url) {
  const protocol = config && config.mediaOptions && config.mediaOptions.protocol ? config.mediaOptions.protocol : defaultMediaProtocol
  if (!url || url.substring(0,7) !== protocol) {
    console.log(`Invalid url: File skipped`)
    return
  }

  return url
}

function deleteFile(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) throw err;
    console.log(`${filePath} was deleted`);
  })
}

function upload(params) {
  const url = params && params.file ? params.file : null
  const id = params && params.resource_id ? `${params.resource_id}` : null
  if (!validateUrl(config, url) && !id) {
    return
  }

  const fileName = url.substring(url.lastIndexOf('/') + 1, url.length)
  const mediaPath = createMediaDir(config)
  const fullFileName = `${mediaPath}/${id}_${fileName}`
  mediaDownload(url, fullFileName, (processOk) => {
    if (processOk) {
      if (uploadFile(config, fullFileName, fileName)) {
        console.log(`File ${fileName} uploaded to sftp server`)
        deleteFile(fullFileName)
      } else {
        console.log(`Unable to upload ${fileName} to sftp server`)
      }
    } else {
      console.log(`Problem with resource ${url} to sftp server`)
    }
  })
}

module.exports = {
  upload
}
