var mongoose   = require('mongoose');
var Schema     = mongoose.Schema;

var userSchema = new Schema({
  id:  String,
  name: String,
  comment:   String,
  deleted: Boolean,
});

module.exports = mongoose.model('User', UserSchema);
