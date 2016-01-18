var mongoose   = require('mongoose');

var Schema     = mongoose.Schema;

var User = new Schema({
  name: String,
  comment:   String,
  deleted: Boolean
});

module.exports = mongoose.model('User', User);
