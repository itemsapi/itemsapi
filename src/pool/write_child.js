const itemsjs = require('./../clients/itemsjs');

module.exports.index_cb = function (index_name, data, callback) {

  itemsjs.index(index_name, data)
    .then(res => {
      callback(null, res);
    })
    .catch(res => {
      callback(res);
    });
};

module.exports.set_configuration_cb = function (index_name, data, callback) {
  callback(null, itemsjs.set_configuration(index_name, data));
};
