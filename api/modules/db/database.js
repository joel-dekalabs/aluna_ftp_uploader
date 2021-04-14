'use strict';

const mysql = require('mysql');

class DB {
  constructor(config) {
    this.pool = mysql.createPool(config);
    console.log(`DB Module Pool created to ${config.database}@${config.host}`);
  }

  getConnection() {
    return new Promise( (resolve, reject) => {
      this.pool.getConnection( (err, connection) => {
        if (err) {
          console.log('DB Connection Error', err)
          return reject(err);
        }
        resolve(connection);
      });
    });
  }

  queryPromise(connection, sql, params) {
    return new Promise( (resolve, reject) => {
      const q = connection.query(sql, params, (error, results, fields) => {
        if (error) {
          console.log('DB Query Error', error);
          return reject(error);
        }
        resolve({
          results,
          fields
        });
      });
    });
  }

  query(sql, params) {
    return this.getConnection()
    .then(connection => {
      return this.queryPromise(connection, sql, params)
      .then(r => {
        connection.release();
        return r;
      });
    });
  }

  queryAll(sql, params) {
    return this.query(sql, params)
    .then(r => r.results)
    .catch(e => Promise.reject(e));
  }

  queryOne(sql, params) {
    return this.queryAll(sql, params)
    .then(r => r[0] || null)
    .catch(e => Promise.reject(e));
  }
}

module.exports = DB;