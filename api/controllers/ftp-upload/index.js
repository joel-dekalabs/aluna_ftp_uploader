'use strict'
const projectPath = `${process.cwd()}`
const config = require('config')
const sftpClient = require('ssh2-sftp-client')
const request = require('superagent')
const fs = require('fs')

const defaultMediaProtocol = 'http://'
const validStatusCode = 200
const FTP_UPLOAD_STATUSES = {
  UPLOAD_OK: 'ftp_upload_ok',
  UPLOAD_FAILED: 'ftp_upload_failed' 
}

function getFtpFileName(params) {
  const extension = params.file.substring(params.file.lastIndexOf("."), params.file.length)
  let fileName = `${params.resource_type}${params.resource_id}${params.type}`
  fileName = fileName.slice(0, -1)
  fileName = `${fileName}${extension}`
  return fileName
}

async function uploadFile(config, fullFileName, params) {
  const data = fs.createReadStream(fullFileName)
  const sftp = new sftpClient()
  const fileName = getFtpFileName(params)
  const remote = `${config.ftp.rootPath}/${fileName}`
  await sftp.connect(config.ftp)
  await sftp.put(data, remote)
  const connectionResult = await sftp.end()
  return connectionResult
}

function createMediaDir(config) {
  const dir = config && config.mediaOptions && config.mediaOptions.path ? config.mediaOptions.path : `${projectPath}/media`
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir)
  }

  console.log(`Directory ${dir} ok`)
  return dir
}

function mediaProcess(url, fullFileName, fileName, params) {
  let jobStatus = FTP_UPLOAD_STATUSES.UPLOAD_FAILED
  const stream = fs.createWriteStream(fullFileName)
  const req = request.get(url)
  req.pipe(stream)
  
  stream.on('error', () => {
    console.log(`File ${url} errored during pipe`)
    jobStatus = FTP_UPLOAD_STATUSES.UPLOAD_FAILED
  })
  
  stream.on('finish', async () => {
    if (req.response && req.response.statusCode === validStatusCode) {
      console.log(`File ${url} downloaded succesfully: HTTP STATUS CODE ${req.response.statusCode}`)
      try {
        const ftpResult = await uploadFile(config, fullFileName, params)
        if (ftpResult) {
          jobStatus = FTP_UPLOAD_STATUSES.UPLOAD_OK
        }
      } catch (error) {
        console.log(error.message)
        jobStatus = FTP_UPLOAD_STATUSES.UPLOAD_FAILED
      }
    } else {
      console.log(`Error performing request to url ${url}: HTTP STATUS CODE ${req.response.statusCode}`)
    }

    await updateDb(jobStatus, params, url)
    deleteFile(fullFileName)
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
    if (err) {
      console.log(err)
      return
    }

    console.log(`${filePath} deleted in local media folder`)
  })
}

async function updateDb(status, params, fullFileName) {
  const date = new Date(Date.now())
  const statusId = await global.database.components_status_statuses.add(date, status)
  const result = await global.database[`${params.resource_type}s_components`].add(statusId, params.resource_id, 3)
  console.log(`${fullFileName} ${params.resource_id} (${params.resource_type}) ${status}`)
  return result
}

async function upload(params) {
  const url = params && params.file ? params.file : null
  const id = params && params.resource_id ? `${params.resource_id}` : null
  const type = params && params.type ? `${params.type}` : null
  const resourceType = params && params.resource_type ? `${params.resource_type}` : null
  if (!validateUrl(config, url) || !id || !type || !resourceType) {
    await updateDb(FTP_UPLOAD_STATUSES.UPLOAD_FAILED, params, url)
    return
  }

  const fileName = url.substring(url.lastIndexOf('/') + 1, url.length)
  const mediaPath = createMediaDir(config)
  const fullFileName = `${mediaPath}/${id}_${fileName}`
  mediaProcess(url, fullFileName, fileName, params)
}

module.exports = {
  upload
}
