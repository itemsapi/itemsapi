const workerFarm = require('worker-farm');

const workers = workerFarm({
  //maxCallsPerWorker: 5000,
  maxConcurrentWorkers: process.env.CONCURRENCY || require('os').cpus().length,
  //maxConcurrentCallsPerWorker: 20,
  maxConcurrentCalls: Infinity,
  //maxCallTime: process.env.TIMEOUT || 3000,
  maxRetries: 0,
  autoStart: true,
  onChild: function() {
    console.log('Started READ thread')
  }
}, require.resolve('./child'), ['search_cb'])

module.exports.search = function(index_name, params) {

  return new Promise(function(resolve, reject) {
    workers.search_cb(index_name, params, function (err, res) {
      if (err) {
        return reject(err);
      }
      return resolve(res);
    })
  })
}
