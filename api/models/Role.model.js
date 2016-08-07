var mongoose   = require('mongoose');

var Schema     = mongoose.Schema;

var Role = new Schema({
  name: { type:String, unique : true, required : true },
  deleted: Boolean
});

module.exports = mongoose.model('Role', Role);
