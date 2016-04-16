'use strict';

var Asset  = require('../models/Asset');
var Util = require('./Util');

var notFoundMessage = {
  code : 404,
  message : "Activo no encontrado"
};

function assetsGet(req, res) {
  // body...

  Asset.find({deleted:false}, function (err, assets) {
    if(err){
      res.status(500).json(err);
    }
    else {
      var response = [];
      for (var i = 0; i < assets.length; i++) {
        response.push(assets[i].toJSON());
        response[i] = Util.extend(response[i], response[i].value);

        delete response[i].value;
        // response[i].typeId = assets[i].typeId;
        // if(i == assets.length-1)
      }
      res.status(200).json(response);
    }
  });
}

function assetsPost(req, res) {
  var newAsset = new Asset();
  console.log(req.body);

  newAsset.value = {};

  newAsset.deleted = false;
  newAsset.typeId = req.body.typeId;
  delete req.body.typeId;

  Util.extend(newAsset.value,req.body);

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
  });
}

function assetsGetByType(req, res) {
  /**
  * parameters expected in the req:
  * type (String)
  **/
  if (req.swagger.params.typeId.value.match(/^[0-9a-fA-F]{24}$/)){
    Asset.find({typeId: req.swagger.params.typeId.value },function (err, assets) {
      if(err){
        res.status(500).json(err);
      }
      else {
        var response = [];
        for (var i = 0; i < assets.length; i++) {
          response.push(assets[i].toJSON());
          response[i] = Util.extend(response[i], response[i].value);
          delete response[i].value;
          // response[i].typeId = assets[i].typeId;
        }
        res.status(200).json(response);
      }
    });
  }
}

function assetsIdGet(req, res) {
  if (req.swagger.params.id.value.match(/^[0-9a-fA-F]{24}$/)){
    Asset.findById(req.swagger.params.id.value,function (err, asset) {
      if(err){
        res.status(500).json(err);
      }
      else {
        if(asset===null){
          res.status(404).json(notFoundMessage);
        }
        else {
          var aux = asset.toJSON();
          Util.extend(aux, aux.value);
          delete aux.value;
          res.status(200).json(aux);
        }
      }
    });
  }
}

function assetIdDelete(req, res) {
  if (req.swagger.params.id.value.match(/^[0-9a-fA-F]{24}$/)) {
    Asset.findById(req.swagger.params.id.value, function(err, asset) {
      if (err){
        res.status(500).json(err);
      }
      else {
        if(asset===null){
          res.status(404).json(notFoundMessage);
        }
        else{
          asset.deleted = true;
          // save the asset
          asset.save(function(err) {
            if (err){
              res.status(500).json(notFoundMessage);
            } else {
              var response = {code:200, message:"El activo se ha eliminado correctamente."};
              res.status(200).json(response);
            }
          });
        }
      }
    });

  } else {
    res.status(404).json(notFoundMessage);
  }
}

function assetIdPut(req, res) {
  if (req.swagger.params.id.value.match(/^[0-9a-fA-F]{24}$/)) {
    Asset.findById(req.swagger.params.id.value, function(err, asset) {
      if (err){
        res.status(500).json(err);
      }
      else {
        if(asset===null){
          res.status(404).json(notFoundMessage);
        }
        else{

          delete req.body._id;
          delete req.body.__v;
          delete req.body.deleted;
          delete req.body.typeId;

          Util.extend(asset.value, req.body);
          asset.markModified("value");

          asset.save(function(err) {
            if (err){
              res.status(500).json(err);
            } else {
              var response = {code:200, message:"El activo se ha actualizado correctamente."};
              res.status(200).json(response);
            }
          });

        }
      }
    });
  } else {
    res.status(404).json(notFoundMessage);
  }
}


module.exports = {
  assetsGet: assetsGet,
  assetsIdGet: assetsIdGet,
  assetsPost: assetsPost,
  assetsGetByType: assetsGetByType,
  assetIdDelete: assetIdDelete,
  assetIdPut: assetIdPut
};
