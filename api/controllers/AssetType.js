'use strict';

var AssetType  = require('../models/AssetType');
var Util  = require('./Util');

var notFoundMessage = {
  code : 404,
  message : "Activo no encontrado"
};


function atGet(req, res) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  // TODO filter by deleted = false
  AssetType.find(function (err, ats) {
    if(err){
      res.status(500).json(err);
    }
    else {
      res.status(200).json(ats);
    }
  });
}

function atPost(req, res) {
  /**
  * parameters expected in the req:
  * at (AssetType)
  **/

  var newAT = new AssetType();
  newAT.name = req.body.name;
  newAT.comment = req.body.comment;
  newAT.properties = req.body.properties;
  newAT.lifeCycle = req.body.lifeCycle;

  newAT.save(function (err, at) {
    if(err){
      console.log(err);
      res.status(500).json(err);
    }
    else {
      var response = {code:201, id:at._id};
      res.location('/assetTypes/' + at.id);
      res.status(201).json(response);
    }
  });
}

function atIdGet(req, res) {
  /**
  * parameters expected in the req:
  * id (String)
  **/
  if (req.swagger.params.id.value.match(/^[0-9a-fA-F]{24}$/)){
    AssetType.findById(req.swagger.params.id.value, function(err, at) {
      if (err){
        console.log(err);
        res.status(500).json(err);
      }
      else{
        if(at===null){
          var error = {
            code : 404,
            message : "Tipo de activo no encontrado"
          };
          res.status(404).json(error);
        }
        else {
          res.status(200).json(at);
        }
      }
    });
  }
  else {
    var error = {
      code : 404,
      message : "Tipo de activo no encontrada"
    };
    res.status(404).json(error);
  }
}

function atIdPut(req, res) {
  if (req.swagger.params.id.value.match(/^[0-9a-fA-F]{24}$/)) {
    AssetType.findById(req.swagger.params.id.value, function (err, at) {
      if (err) {
        res.status(500).json(err);
      } else {
        if(at === null){
          res.status(404).json(notFoundMessage);
        } else {
          Util.cleanResource(req.body);
          Util.extend(at, req.body);
          console.log(req.body);
          at.save(function (err) {
            if(err){
              res.status(500).json(err);
            }
            else {
              var response = {
                code: 200,
                message: 'Tipo de activo actualizado con éxito'
              };
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


function atIdDelete(req, res) {
  // body...
  if (req.swagger.params.id.value.match(/^[0-9a-fA-F]{24}$/)) {
    if (req.swagger.params.id.value.match(/^[0-9a-fA-F]{24}$/)) {
      AssetType.findById(req.swagger.params.id.value, function (err, at) {
        if (err) {
          res.status(500).json(err);
        } else {
          if(at === null){
            res.status(404).json(notFoundMessage);
          } else {
            at.deleted = true;
            at.save(function (err) {
              if (err) {
                res.status(500).json(err);
              } else {
                var response = {code:200, message:"El tipo de activo ha sido eliminado correctamente."};
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
}

module.exports = {
  atGet: atGet,
  atPost: atPost,
  atIdGet: atIdGet,
  atIdPut: atIdPut,
  atIdDelete: atIdDelete
};
