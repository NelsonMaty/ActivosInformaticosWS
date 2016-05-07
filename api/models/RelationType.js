var mongoose   = require('mongoose');

var Schema     = mongoose.Schema;

var RelationType = new Schema({
  name : String,
  type : String,
  comment: String,
  deleted: Boolean
});

module.exports = mongoose.model('RelationType', RelationType);
