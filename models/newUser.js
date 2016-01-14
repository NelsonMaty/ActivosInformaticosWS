var mongoose   = require('mongoose');
var Schema     = mongoose.Schema;

var newUserSchema = new Schema({
  name: String,
  comment:   String
});

module.exports = mongoose.model('NewUser', newUserSchema);
