var mongoose   = require('mongoose');

var Schema     = mongoose.Schema;

var Person = new Schema({
  name: String,
  email: String,
  phone: String,
  comment: String,
  deleted: Boolean
}, {versionKey: false});

module.exports = mongoose.model('Person', Person);
