'use strict';

var Asset  = require('../models/Asset');
var Relation = require('../models/Relation');
var HistoryAsset = Asset.historyModel();
var ObjectId = require('mongoose').Types.ObjectId;
var AssetType  = require('../models/AssetType');
var Util = require('./Util');
var exec = require('child_process').exec;
var _ = require('lodash/core');


var notFoundMessage = {
  code : 404,
  message : "Activo no encontrado"
};

function getMongoQuery(stringQuery) {
  var aux = JSON.parse(stringQuery);
  var formatedAttribute;
  for (var key in aux) {
    //if not an And-Or search
    formatedAttribute = "value." + key;
    if(key[0]!="$"){
      if(typeof aux[key] == "string"){
          aux[formatedAttribute] = new RegExp(aux[key], "i");
      }
      else {
        aux[formatedAttribute] = aux[key];
      }
      delete aux[key];
    }
    else {
      aux[formatedAttribute] = aux[key];
      for (var i = 0; i < aux[key].length; i++) {
        aux[key][i] = getMongoQuery(JSON.stringify(aux[key][i]));
      }
      delete aux[key];
    }
  }
  return aux;
}

function assetsGet(req, res) {

  // 1) First case, a patternSearch has been requested
  if(req.swagger.params.patternSearch.value){
    //1.1 Check if the request is a valid json
    var aux;
    try{
      aux = JSON.parse(req.swagger.params.patternSearch.value);
    }catch(error){
      res.status(400).json({message: "Syntax error"});
      return;
    }

    //1.2 Format the request appropriately, acording to our mongodb structure
    var mongoQuery = getMongoQuery(req.swagger.params.patternSearch.value);
    //1.3 Perform the search
    Asset.find(mongoQuery, function(err, assets) {
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
    return;
  }
  // 2) Second case, an Elastic Search has been requested
  else if(req.swagger.params.elasticSearch.value){
    Asset.search({
      query_string: {
        query: req.swagger.params.elasticSearch.value
      }
    }, function(err, results) {
      if(err){
        res.status(500).json(err);
      }
      else {
        var response = [];
        for (var i = 0; i < results.hits.hits.length; i++) {
          response.push(results.hits.hits[i]._source);
          response[i] = Util.extend(response[i], response[i].value);
          delete response[i].value;
          response[i]._id = results.hits.hits[i]._id;
          // response[i].typeId = assets[i].typeId;
          // if(i == assets.length-1)
        }
        res.status(200).json(response);
      }
    });
    return;
  }

  // 3) Third case, search by asset type name
  else if(req.swagger.params.assetTypeName.value){
    var query = new RegExp(req.swagger.params.assetTypeName.value, "i");
    AssetType.findOne({name: query}, function (err, at) {
      if(err){
        res.status(500).json(err);
        return;
      }
      var response = [];
      if(at===null){
        console.log(at);
        res.status(200).json(response);
        return;
      }
      Asset.find({typeId: at._id},function (err, assets) {
        if(err){
          res.status(500).json(err);
          return;
        }
        var response = [];
        for (var i = 0; i < assets.length; i++) {
          response.push(assets[i].toJSON());
          response[i] = Util.extend(response[i], response[i].value);
          delete response[i].value;
        }
        res.status(200).json(response);
        return;
      });
    });
  }

  // 4) Fourth case, a list of all assets has been requested (no searching needed)
  else {
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
      }
      res.status(200).json(response);
    }
  });
  }
}

function assetsPost(req, res) {
  var newAsset = new Asset();

  newAsset.value = {};
  var dataType;

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
    var invalidType = {};
    // 3.0 - Check if the asset has a valid definition
    for (var i = 0; i < at.properties.length; i++) {
      // 3.0.1 - All the required properties must be present
      if(at.properties[i].required){
        if(typeof req.body[at.properties[i].name] === undefined){
          var missingParam = {
            code : 400,
            message : "La propiedad '"+at.properties[i].name+"' debe estar definida."
          };
          res.status(400).json(missingParam);
          return;
        }
      }
      // 3.0.2 - Data types must be valid
      dataType = typeof req.body[at.properties[i].name];
      switch (at.properties[i].type) {
        case "String":
          if( dataType != "string" && dataType != "undefined"){
            invalidType = {
              code: 400,
              message: "La propiedad '"+at.properties[i].name+"' debe ser de tipo String."
            };
            res.status(400).json(invalidType);
            return;
          }
          break;
        case "Boolean":
          if( dataType !== "boolean" && dataType != "undefined"){
            invalidType = {
              code: 400,
              message: "La propiedad '"+at.properties[i].name+"' debe ser de tipo Boolean."
            };
            res.status(400).json(invalidType);
            return;
          }
          break;
        case "Integer":
          if(!isInt(req.body[at.properties[i].name]) && dataType != "undefined"){
            invalidType = {
              code: 400,
              message: "La propiedad '"+at.properties[i].name+"' debe ser de tipo Integer."
            };
            res.status(400).json(invalidType);
            return;
          }
          break;
        case "Float":
          if(!isFloat(req.body[at.properties[i].name]) && dataType != "undefined"){
            invalidType = {
              code: 400,
              message: "La propiedad '"+at.properties[i].name+"' debe ser de tipo Float."
            };
            res.status(400).json(invalidType);
            return;
          }
          break;
        case "Date":
          if(isNaN(Date.parse(req.body[at.properties[i].name])) && dataType != "undefined"){
            invalidType = {
              code: 400,
              message: "La propiedad '"+at.properties[i].name+"' debe ser de tipo Date."
            };
            res.status(400).json(invalidType);
            return;
          }
          break;
        case "List":
          if( Object.prototype.toString.call( req.body[at.properties[i].name] ) !== '[object Array]' && dataType != "undefined"){
            invalidType = {
              code: 400,
              message: "La propiedad '"+at.properties[i].name+"' debe ser de tipo List."
            };
            res.status(400).json(invalidType);
            return;
          }
          break;
        default:
      }
    }
    // 4.0 - If no current state is set, then use the default
    if(req.body.estadoActual === undefined){
      for (i = 0; i < at.lifeCycle.length; i++) {
        if(at.lifeCycle[i].isInitial){
          req.body.estadoActual = at.lifeCycle[i].name;
          break;
        }
      }
    }
    else {
      // 4.1 - Current state must be valid
      var isValidState = false;
      for (i = 0; i < at.lifeCycle.length; i++) {
        if(req.body.estadoActual.toLowerCase() == at.lifeCycle[i].name.toLowerCase()){
          isValidState = true;
          break;
        }
      }
      if(!isValidState){
        var invalidState = {
          code : 400,
          message : "El estado '"+req.body.estadoActual+"' no existe en el ciclo de vida del activo."
        };
        res.status(400).json(invalidState);
        return;
      }
    }

    newAsset.deleted = false;
    newAsset.typeId = req.body.typeId;
    delete req.body.typeId;

    if(newAsset.stakeholders === undefined){
      newAsset.stakeholders = [];
    }

    if(newAsset.tags === undefined){
      newAsset.tags = [];
    }

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
        return;
      }
      if(asset===null){
        res.status(404).json(notFoundMessage);
        return;
      }
      asset.deleted = true;
      // save the asset
      asset.save(function(err) {
        if (err){
          res.status(500).json(notFoundMessage);
          return;
        }
        //delete all relations associated with asset
        Relation.update(
          {$or:[{assetId:req.swagger.params.id.value},{relatedAssetId:req.swagger.params.id.value}]},
          {deleted:true},
          {multi:true},
          function (err) {
            if (err){
              res.status(500).json(notFoundMessage);
              return;
            }
          });

          //remove index from elastic search
          asset.unIndex(function (err) {
            if (err){
              res.status(500).json(err);
            }
            else {
              var response = {code:200, message:"El activo se ha eliminado correctamente."};
              res.status(200).json(response);
            }
            return;
          });
      });
    });

  } else {
    res.status(404).json(notFoundMessage);
  }
}

function assetIdPut(req, res) {
    var dataType;
  // 1 - Check if the asset id is valid
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
          if(_.isEqual(req.body,asset.toJSON().value)){
            var response = {code:304, message:"No se detectaron cambios en el activo."};
            res.status(304).json(response);
            return;
          }
          // 2 - Check if the assetype exists
          AssetType.findById(asset.typeId, function(err, at) {
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
            var invalidType = {};
            // 3.0 - Check if the asset has a valid definition
            for (var i = 0; i < at.properties.length; i++) {
              dataType = typeof req.body[at.properties[i].name];
              switch (at.properties[i].type) {
                case "String":
                  if( dataType != "string" && dataType != "undefined"){
                    invalidType = {
                      code: 400,
                      message: "La propiedad '"+at.properties[i].name+"' debe ser de tipo String."
                    };
                    res.status(400).json(invalidType);
                    return;
                  }
                  break;
                case "Boolean":
                  if( dataType != "boolean" && dataType != "undefined"){
                    invalidType = {
                      code: 400,
                      message: "La propiedad '"+at.properties[i].name+"' debe ser de tipo Boolean."
                    };
                    res.status(400).json(invalidType);
                    return;
                  }
                  break;
                case "Integer":
                  if(!isInt(req.body[at.properties[i].name]) && dataType != "undefined"){
                    invalidType = {
                      code: 400,
                      message: "La propiedad '"+at.properties[i].name+"' debe ser de tipo Integer."
                    };
                    res.status(400).json(invalidType);
                    return;
                  }
                  break;
                case "Float":
                  if(!isFloat(req.body[at.properties[i].name]) && dataType != "undefined"){
                    invalidType = {
                      code: 400,
                      message: "La propiedad '"+at.properties[i].name+"' debe ser de tipo Float."
                    };
                    res.status(400).json(invalidType);
                    return;
                  }
                  break;
                case "Date":
                  if(isNaN(Date.parse(req.body[at.properties[i].name])) && dataType != "undefined"){
                    invalidType = {
                      code: 400,
                      message: "La propiedad '"+at.properties[i].name+"' debe ser de tipo Date."
                    };
                    res.status(400).json(invalidType);
                    return;
                  }
                  break;
                case "List":
                  if(  Object.prototype.toString.call( req.body[at.properties[i].name] ) !== '[object Array]' && dataType != "undefined"){
                    invalidType = {
                      code: 400,
                      message: "La propiedad '"+at.properties[i].name+"' debe ser de tipo List."
                    };
                    res.status(400).json(invalidType);
                    return;
                  }
                  break;
                default:
              }
            }

            // 4 - Current state must be valid. The transition must be allowed as well
            if(req.body.estadoActual && req.body.estadoActual.toLowerCase() != asset.value.estadoActual.toLowerCase()){
              var isValidState = false;
              var statesAllowed = [];
              for (i = 0; i < at.lifeCycle.length; i++) {
                if(req.body.estadoActual.toLowerCase() == at.lifeCycle[i].name.toLowerCase()){
                  isValidState = true;
                }
                if(asset.value.estadoActual == at.lifeCycle[i].name){
                  statesAllowed = at.lifeCycle[i].adjacents;
                }
              }
              if(!isValidState){
                var invalidState = {
                  code : 400,
                  message : "El estado '"+req.body.estadoActual+"' no existe en el ciclo de vida del activo."
                };
                res.status(400).json(invalidState);
                return;
              }
              if(statesAllowed.indexOf(req.body.estadoActual) < 0){
                var invalidTransition = {
                  code : 400,
                  message : "La transición al estado '"+req.body.estadoActual+"' no es posible desde el estado '"+asset.value.estadoActual+"'."
                };
                res.status(400).json(invalidTransition);
                return;
              }
            }

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

function isFloat(val) {
  var floatRegex = /^-?\d+(?:[.]\d*?)?$/;
  if (!floatRegex.test(val)){
    return false;
  }

  val = parseFloat(val);
  if (isNaN(val)){
    return false;
  }
  return true;
}

function isInt(val) {
  var intRegex = /^-?\d+$/;
  if (!intRegex.test(val)){
    return false;
  }

  var intVal = parseInt(val, 10);
  return parseFloat(val) == intVal && !isNaN(intVal);
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
