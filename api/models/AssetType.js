var mongoose   = require('mongoose');

var Schema     = mongoose.Schema;

var Property = new Schema({
  name : String,
  type : String,
  required: Boolean,
  comment: String
}, { _id: false });

var AssetType = new Schema({
  name:       String,
  comment:    String,
  properties: [Property]
});

module.exports = mongoose.model('AssetType', AssetType);
