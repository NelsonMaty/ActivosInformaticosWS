var mongoose   = require('mongoose');

var Schema     = mongoose.Schema;

var Relation = new Schema({
  name : String,
  isCritical: Boolean,
  assetId : {type: Schema.Types.ObjectId, ref: 'Asset'},
  relatedAssetId : {type: Schema.Types.ObjectId, ref: 'Asset'},
  relationTypeId :{type: Schema.Types.String, ref: 'RelationType'},
  deleted: Boolean,
  comment: String
});


module.exports = mongoose.model('Relation', Relation);
