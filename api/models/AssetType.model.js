var mongoose   = require('mongoose');

var Schema     = mongoose.Schema;

var Property = new Schema({
  name : String,
  type : String,
  required: Boolean,
  comment: String
}, { _id: false });

var Node = new Schema({
  name : String,
  isInitial : Boolean,
  isFinal: Boolean,
  adjacents: [String],
  comment: String
}, { _id: false });


var AssetType = new Schema({
  name:       String,
  comment:    String,
  properties: [Property],
  lifeCycle:  [Node]
});

module.exports = mongoose.model('AssetType', AssetType);
