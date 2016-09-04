var mongoose   = require('mongoose');

var Schema     = mongoose.Schema;

var Subscription = new Schema({
  assetId: { type: Schema.Types.ObjectId, ref: 'Asset'},
  events: [String],
  callbackUrl: String
}, {versionKey: false});

module.exports = mongoose.model('Subscription', Subscription);
