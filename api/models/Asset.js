var mongoose   = require('mongoose');
var mongooseHistory = require('mongoose-history');
var Schema     = mongoose.Schema;


var Asset = new Schema({
      typeId :   { type: Schema.Types.ObjectId, ref: 'AssetType'},
     deleted :   Boolean,
     value :   Schema.Types.Mixed
},  { strict: false });

Asset.plugin(mongooseHistory);

module.exports = mongoose.model('Asset', Asset);
