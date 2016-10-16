var mongoose   = require('mongoose');
var mongooseHistory = require('mongoose-history');
var mongoosastic = require('mongoosastic');
var Schema     = mongoose.Schema;

var Stakeholder = new Schema({
  personId : { type: Schema.Types.ObjectId, ref: 'Person'},
  name: String,
  role : String
}, {_id:false});

var Asset = new Schema({
    typeId :   { type: Schema.Types.ObjectId, ref: 'AssetType'},
   deleted :   Boolean,
   stakeholders : [Stakeholder],
     value :   Schema.Types.Mixed
},  { strict: false });

Asset.plugin(mongooseHistory);

var config = require(process.env.CONF||'/etc/nodejs-config/itam.json').elasticsearch;
var es = config.host + config.port;

Asset.plugin(mongoosastic, {
  hosts: [
    config.host + ":" + config.port
  ]
});


module.exports = mongoose.model('Asset', Asset);
//
// var Asset2 = mongoose.model('Asset', Asset)
//   , stream = Asset2.synchronize()
//   , count = 0;
//
//   count++;
// stream.on('data', function(err, doc){
// });
// stream.on('close', function(){
//   console.log('indexed ' + count + ' documents!');
// });
// stream.on('error', function(err){
//   console.log(err);
// });
