'use strict';

var Asset  = require('../models/Asset');
var HistoryAsset = Asset.historyModel();
var ObjectId = require('mongoose').Types.ObjectId;
var AssetType  = require('../models/AssetType');
var Util = require('./Util');
var exec = require('child_process').exec;


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

  newAsset.value = {};

  // 1 - Check if the assetype id is valid
  if (!req.body.typeId.match(/^[0-9a-fA-F]{24}$/)){
    var error = {
      code : 404,
      message : "Tipo de activo no encontrada"
    };
    res.status(404).json(error);
    return;
  }

  // 2 - Check if the assetype exists
  AssetType.findById(req.body.typeId, function(err, at) {

    if (err){
      console.log(err);
      res.status(500).json(err);
      return;
    }

    if(at===null){
      var error = {
        code : 404,
        message : "Tipo de activo no encontrado"
      };
      res.status(404).json(error);
      return;
    }

    // 3 - Check if the asset has a valid definition




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

function graphIdGet(req, res) {
  if (!req.swagger.params.id.value.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(404).json(notFoundMessage);
    return;
  }
  Asset.findById(req.swagger.params.id.value, function (err, asset) {
    if (err) {
      res.status(500).json(err);
      return;
    }
    if(asset === null){
      res.status(404).json(notFoundMessage);
      return;
    }
    AssetType.findById(asset.typeId, function (err, at) {
      if (err) {
        res.status(500).json(err);
        return;
      }
      if(at === null){
        res.status(404).json(notFoundMessage);
        return;
      }
      ////////////////////////////////////////////////
      var graph = at.lifeCycle;
      var stateGraph = " ";
      var auxGraph = asset.value.estadoActual.replace(" ", "_")  + " [style=filled, fillcolor=yellow, shape = circle];";
      auxGraph += graph[0].name.replace(" ", "_");
      var confGraph = 'digraph life_cycle { rankdir=LR; node [shape = doublecircle]; '+auxGraph+' ';


      for (var i=0;i<graph.length;i++) {
        if (graph[i].isFinal) {

          auxGraph = graph[i].name.replace(" ","_");
          confGraph += auxGraph+'; node [shape = circle]; ';
        }

        for ( var j=0;j<graph[i].adjacents.length;j++) {
          if (!graph[i].isFinal) {
            auxGraph = graph[i].name.replace(" ","_");
            var auxGraph2 = graph[i].adjacents[j].replace(" ","_");

            stateGraph += auxGraph+' -> '+auxGraph2+'; ';
          }
        }
      }
      stateGraph += " }";
      confGraph += stateGraph;

      console.log(confGraph);
      var cmd = 'echo "' +confGraph+ '" | dot -Tpng';
      var options = {
        encoding: 'binary',
        timeout: 0,
        maxBuffer: 200*1024,
        killSignal: 'SIGTERM',
        cwd: null,
        env: null
      };
      exec(cmd, options,function (err, stdout, stderr) {
        var buffer = new Buffer(stdout, 'binary');
        res.status(200).json({graph:buffer.toString("base64")});
      });
      ///////////////////////////////////////////////
    });
  });
}

function assetVersionsGet(req, res) {
  if (!req.swagger.params.id.value.match(/^[0-9a-fA-F]{24}$/)){
    res.status(404).json({
      code: 404,
      message: "No se encontró ningun activo con id " + req.swagger.params.id.value
    });
    return;
  }
  Asset.findById(req.swagger.params.id.value, function (err, a) {
    if(err){
      res.status(500).json(err);
      return;
    }
    if(a===null){
      res.status(404).json({
        code: 404,
        message: "No se encontró ningun activo con id " + req.swagger.params.id.value
      });
      return;
    }
    HistoryAsset.find({"d._id": new ObjectId(req.swagger.params.id.value)},null, {sort: '-t'}, function (err, versions) {
      if(err){
        res.status(500).json(err);
        return;
      }
      var response = [];
      for (var i = 0; i < versions.length; i++) {
        response.push(versions[i].toJSON());
        response[i].asset = response[i].d;
        delete response[i].d;
        response[i].asset = Util.extend(response[i].asset, response[i].asset.value);
        delete response[i].asset.value;
        response[i].date = response[i].t;
        delete response[i].t;
        response[i].idVersion = response[i]._id;
        delete response[i]._id;
        delete response[i].o;
      }
      res.status(200).json(response);
      return;
    });
  });
}

module.exports = {
  assetsGet: assetsGet,
  assetsIdGet: assetsIdGet,
  assetsPost: assetsPost,
  assetsGetByType: assetsGetByType,
  assetIdDelete: assetIdDelete,
  assetIdPut: assetIdPut,
  graphIdGet: graphIdGet,
  assetVersionsGet: assetVersionsGet
};
