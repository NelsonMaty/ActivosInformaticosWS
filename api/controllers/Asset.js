'use strict';
var mongoose   = require('mongoose');
var Asset  = require('../models/Asset');
var Util = require('./Util');

module.exports = {
  assetsGet: assetsGet,
  assetsIdGet: assetsIdGet,
  assetsPost: assetsPost,
  assetsGetByType: assetsGetByType
}

function assetsGet(req, res) {
  // body...

  Asset.find(function (err, assets) {
    if(err){
      res.status(500).json(err);
    }
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

function assetsGetByType(req, res) {
  /**
  * parameters expected in the req:
  * type (String)
  **/
  if (req.swagger.params.typeId.value.match(/^[0-9a-fA-F]{24}$/)){
    console.log(req.swagger.params.typeId.value);
    Asset.find({ "value.typeId": req.swagger.params.typeId.value },function (err, assets) {
      if(err){
        res.status(500).json(err);
      }
      else {
        var response = [];
        for (var i = 0; i < assets.length; i++) {
          response.push(assets[i].toJSON())
          response[i] = Util.extend(response[i], response[i].value);
          delete response[i].value;
          delete response[i].assetType;
        }
        res.status(200).json(response);
      }
    })
  }
}

function assetsIdGet(req, res) {
  if (req.swagger.params.id.value.match(/^[0-9a-fA-F]{24}$/)){
    Asset.findById(req.swagger.params.id.value,function (err, asset) {
      if(err){
        res.status(500).json(err);
      }
      else {
        if(asset==null){
          var error = {
            code : 404,
            message : "Activo no encontrado"
          }
          res.status(404).json(error)
        }
        else {
          console.log(asset);
          res.status(200).json(asset);
        }
      }
    })
  }
}

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
