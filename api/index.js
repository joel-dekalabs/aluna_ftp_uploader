'use strict';

const config = require(process.cwd() + '/config/default')

console.log(`Starting ${require('../package').description} server ${require('../package').version} ...`);

Promise.all([
  require('@xtreamr/ds_rabbitmq').start(config),
  require('./modules/db').start()
])
.then(() => {
  console.log('Modules loaded');
  return require('./frontend').start();
})
.then(() => {
  console.log('Aluna hls video checker consumer started !');
})
.catch(e => {
  console.log('An unexpected error !', e);
});
