'use strict'

const client = require('@xtreamr/ds_rabbitmq').client
const config = require('config')
const ftpUpload = require(process.cwd() + '/api/controllers/ftp-upload')

function convert(params) {
  return ftpUpload.upload(params)
}

const actions = {
  convert
}

function initProcessor() {
  client(null, 'video_converter', null, config, (msg, cb) => {
    console.log(msg);
    if (Object.keys(actions).indexOf(msg.action) >= 0) {
      actions[msg.action](msg.params || {})
        .then(res => cb(res))
        .catch(err => cb({
          error: err,
          status: 404
        }));
    } else {
      cb({
        error: 'Function not found',
        status: 404
      });
    }
  })
}

module.exports = {
  start: initProcessor
}