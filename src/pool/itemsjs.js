const workerFarm = require('worker-farm');

const read_workers = workerFarm({
  maxConcurrentWorkers: process.env.CONCURRENCY || require('os').cpus().length,
  maxConcurrentCalls: Infinity,
  maxRetries: 0,
  autoStart: true,
  onChild: function() {
    console.log('Started READ thread')
  }
}, require.resolve('./read_child'), ['search_cb'])

const write_workers = workerFarm({
  maxConcurrentWorkers: process.env.CONCURRENCY || require('os').cpus().length,
  maxConcurrentCalls: Infinity,
  maxRetries: 0,
  autoStart: true,
  onChild: function() {
    console.log('Started WRITE thread')
  }
}, require.resolve('./write_child'), ['index_cb', 'set_configuration_cb'])

module.exports.search = function(index_name, params) {

  return new Promise(function(resolve, reject) {
    read_workers.search_cb(index_name, params, function (err, res) {
      if (err) {
        return reject(err);
      }
      return resolve(res);
    })
  })
}

module.exports.index = function(index_name, params) {

  return new Promise(function(resolve, reject) {
    write_workers.index_cb(index_name, params, function (err, res) {
      if (err) {
        return reject(err);
      }
      return resolve(res);
    })
  })
}

module.exports.set_configuration = function(index_name, params) {

  return new Promise(function(resolve, reject) {
    write_workers.set_configuration_cb(index_name, params, function (err, res) {
      if (err) {
        return reject(err);
      }
      return resolve(res);
    })
  })
}
