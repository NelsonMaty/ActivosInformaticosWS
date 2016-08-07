var mongoose   = require('mongoose');

var Schema     = mongoose.Schema;

var RelationType = new Schema({
  _id : String,
  outLabel : String,
  inLabel : String,
  comment: String,
  deleted: Boolean
});

module.exports = mongoose.model('RelationType', RelationType);
