var mongoose   = require('mongoose');

var Schema     = mongoose.Schema;

var Relation = new Schema({
  isCritical: Boolean,
  isIncomingRel: Boolean,
  assetId : {type: Schema.Types.ObjectId, ref: 'Asset'},
  relatedAssetId : {type: Schema.Types.ObjectId, ref: 'Asset'},
  relationTypeId :{type: Schema.Types.String, ref: 'RelationType'},
  counterRelation : {type: Schema.Types.ObjectId, ref: 'Relation'},
  deleted: Boolean,
  comment: String
});


module.exports = mongoose.model('Relation', Relation);
