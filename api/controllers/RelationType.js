'use strict';

var RelationType  = require('../models/RelationType.model');
var Util  = require('./Util');


function relTypeGet(req, res) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  RelationType.find({deleted:false}, function (err, relTypes) {
    if(err){
      res.status(500).json(err);
    }
    else {
      res.status(200).json(relTypes);
    }
  });
}

function relTypePost(req, res) {
  RelationType.findById(req.body._id, function(err, relType) {
    if(relType !== null){
      var response = {code:403, message:'El tipo de relación "'+req.body._id+'" ya existe.'};
      res.status(403).json(response);
      return;
    }
    var newRelType = new RelationType();
    newRelType._id = req.body._id;
    newRelType.inLabel = req.body.inLabel;
    newRelType.outLabel = req.body.outLabel;
    newRelType.comment = req.body.comment;
    newRelType.deleted = false;

    newRelType.save(function (err, relType) {
      if(err){
        console.log(err);
        res.status(500).json(err);
      }
      else {
        var response = {code:201, id:relType._id};
        res.location('/relType/' + relType.id);
        res.status(201).json(response);
      }
    });
  });
}

function relTypeIdGet(req, res) {
  RelationType.findById(req.swagger.params.id.value, function(err, relType) {
    if (err){
      console.log(err);
      res.status(500).json(err);
    }
    else{
      if(relType===null){
        var error = {
          code : 404,
          message : "Tipo de relación no encontrado"
        };
        res.status(404).json(error);
      }
      else {
        res.status(200).json(relType);
      }
    }
  });
}

function relTypeIdPut(req, res) {
  RelationType.findById(req.swagger.params.id.value, function(err, relType) {
    if (err){
      res.status(500).json(err);
    }
    else {
      if(relType === null){
        var error = {
          code : 404,
          message : "Tipo de relación no encontrada"
        };
        res.status(404).json(error);
      }
      else {
        Util.extend(relType, req.swagger.params.relType.value);
        // save the relType
        relType.save(function(err) {
          if (err){
            res.status(500).json(err);
          }
          else {
            var response = {
              code: 200,
              message: 'Tipo de relación actualizado con éxito'
            };
            res.status(200).json(response);
          }
        });
      }
    }
  });
}

function relTypeIdDelete(req, res) {
  RelationType.findById(req.swagger.params.id.value, function(err, relType) {
    if (err){
      res.status(500).json(err);
    }
    else {
      if(relType===null){
        var error = {
          code : 404,
          message : "Tipo de relación no encontrado"
        };
        res.status(404).json(error);
      }
      else {
        relType.deleted = true;
        // save the relType
        relType.save(function(err) {
          if (err){
            console.log(err);
            var error = {
              code : 500,
              message : "Error en la base de datos"
            };
            res.status(500).json(error);
          }
          else {
            var response = {
              code: 200,
              message: 'Tipo de relación eliminado con éxito'
            };
            res.status(200).json(response);
          }
        });
      }
    }
  });
}

module.exports = {
  relTypeGet: relTypeGet,
  relTypePost: relTypePost,
  relTypeIdGet: relTypeIdGet,
  relTypeIdDelete: relTypeIdDelete,
  relTypeIdPut: relTypeIdPut
};
