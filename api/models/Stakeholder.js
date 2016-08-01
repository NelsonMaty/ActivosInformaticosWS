var mongoose   = require('mongoose');

var Schema     = mongoose.Schema;

var Stakeholder = new Schema({
  name: String,
  email: String,
  phone: String,
  comment: String,
  deleted: Boolean
});

module.exports = mongoose.model('Stakeholder', Stakeholder);
