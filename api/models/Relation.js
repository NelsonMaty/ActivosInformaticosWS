var mongoose   = require('mongoose');

var Schema     = mongoose.Schema;

var Relation = new Schema({
  name : String,
  isCritical: Boolean,
  relatedAssetId : {type: Schema.Types.ObjectId, ref: 'Asset'},
  deleted: Boolean,
  comment: String
});


module.exports = mongoose.model('Relation', Relation);
