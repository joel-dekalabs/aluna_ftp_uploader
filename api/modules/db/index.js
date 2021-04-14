'use strict';

const config = require('config').database
const aluna_db = require('./aluna');

module.exports = {
  start: () => {
    global.database = new aluna_db(config)
    return Promise.resolve()
  }
};
