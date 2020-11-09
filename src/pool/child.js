const itemsjs = require('itemsjs-server-optimized')();

module.exports.search_cb = function (index_name, data, callback) {

  itemsjs.search(index_name, data, {})
  .then(res => {
    callback(null, res)
  })
  .catch(res => {
    callback(res)
  });
}
