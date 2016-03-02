'use strict';
var mongoose   = require('mongoose');
var Asset  = require('../models/Asset');
var Util = require('./Util');

module.exports = {
  assetsGet: assetsGet,
  // assetsIdGet: assetsIdGet,
  // assetsGetByType: assetsGetByType,
  assetsPost: assetsPost
}

function assetsGet(req, res) {
  // body...

  Asset.find(function (err, assets) {
    if(err)
      res.status(500).json(err);
    else {
      var response = [];
      for (var i = 0; i < assets.length; i++) {
        response.push(assets[i].toJSON())
        response[i] = Util.extend(response[i], response[i].value);
        delete response[i].value;
        // if(i == assets.length-1)
      }
      res.status(200).json(response);
    }
  })

}

// function assetsIdGet(req, res) {
//   // body...
//   var asset = {
//     type: 'harddrive',
//     id: 'asd',
//     asd: 'dont break'
//   };
//
//   res.status(200).json(asset);
//
// }

// function assetsGetByType(req, res) {
//   // body...
//   var assets = [{
//     type: 'harddrive',
//     id: 'asd',
//     asd: 'dont break'
//   }];
//
//   res.status(200).json(assets);
//
// }

function assetsPost(req, res) {
  var newAsset = new Asset();
  console.log(req.body);
  newAsset.value = {}
  Util.extend(newAsset.value,req.body);
  newAsset.deleted = false;

  newAsset.save(function (err, asset) {
    if(err){
      console.log(err);
      res.status(500).json(err);
    }
    else {
      var response = {code:201, id:asset._id};
      res.location('/assets/' + asset.id);
      res.status(201).json(response);
    }
  })
}
