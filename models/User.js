var mongoose   = require('mongoose');
mongoose.connect('mongodb://mongo@127.0.0.1:27017');

var Schema     = mongoose.Schema;

var User = new Schema({
  name: String,
  comment:   String,
  deleted: Boolean
});

module.exports = mongoose.model('User', User);
