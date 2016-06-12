var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Collection = new Schema({
  name: String,
  type: String,
  index: String,
  // `schema` keyword is reserved :(
  normalSchema: Schema.Types.Mixed,
  /*schema: {
    $type: String
  },*/
  extraSchema: Schema.Types.Mixed,
  aggregations: Schema.Types.Mixed,
  sortings: Schema.Types.Mixed,
  table: Schema.Types.Mixed,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

/*var virtual = Collection.virtual('test');
virtual.get(function () {
  return 'ok'
});*/

module.exports = mongoose.model('Collection', Collection);
