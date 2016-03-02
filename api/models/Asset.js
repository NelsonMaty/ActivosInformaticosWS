var mongoose   = require('mongoose');

var Schema     = mongoose.Schema;

var Asset = new Schema({
   assetType :   { type: Schema.Types.ObjectId, ref: 'AssetType' },
     deleted :   Boolean,
       value :   Schema.Types.Mixed
},  { strict: false });

module.exports = mongoose.model('Asset', Asset);
