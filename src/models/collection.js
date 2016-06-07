var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Collection = new Schema({
  name: String,
  type: String,
  index: String,
  schema: Schema.Types.Mixed,
  aggregations: Schema.Types.Mixed,
  sortings: Schema.Types.Mixed,
  table: Schema.Types.Mixed,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Collection', Collection);
