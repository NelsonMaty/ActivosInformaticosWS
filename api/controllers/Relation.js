'use strict';

var Relation = require('../models/Relation');
var Asset  = require('../models/Asset');

var Util  = require('./Util');

function resNotFound(res, message) {
  res.status(404).json({
    code: 404,
    message: message
  });
}

function relationPost(req, res) {
  // 1 - Check if the source asset id provided is valid
  if (!req.swagger.params.id.value.match(/^[0-9a-fA-F]{24}$/)){
    resNotFound(res,"No se encontró ningun activo con id " + req.swagger.params.id.value );
    return;
  }

  // 2 - Check if the target asset id provided is valid
  if (!req.body.relatedAssetId.match(/^[0-9a-fA-F]{24}$/)){
    resNotFound(res,"No se encontró ningun activo con el id " + req.body.relatedAssetId );
    return;
  }

  // 3 - Check if the source asset exists
  Asset.findById(req.swagger.params.id.value, function (err, a) {
    if(err){
      res.status(500).json(err);
    }
    else {
      if(a===null){
        resNotFound(res,"No se encontró ningun activo con el id " + req.swagger.params.id.value );
        return;
      }

  // 4 - Check if the target asset exists
      Asset.findById(req.body.relatedAssetId, function (err, b) {
        if(err){
          res.status(500).json(err);
        }
        else {
          if(b===null){
            resNotFound(res,"No se encontró ningun activo con el id " + req.body.relatedAssetId );
            return;
          }

  // 5 - Create relation
          var newRelation = new Relation();
          newRelation.deleted = false;
          newRelation.assetId = req.swagger.params.id.value;
          Util.extend(newRelation, req.body);

          newRelation.save(function (err,relation) {
            if(err){
              console.log(err);
              res.status(500).json(err);
            }
            else {
              var response = {code:201, id:relation._id};
              res.location('/assets/' + req.swagger.params.id.value + '/relations/' + relation.id);
              res.status(201).json(response);
            }
          });
        }
      });
    }
  });
}

function relationGet(req, res) {

  // 1 - Check if the source asset id provided is valid
  if (!req.swagger.params.id.value.match(/^[0-9a-fA-F]{24}$/)){
    resNotFound(res,"No se encontró ningun activo con id " + req.swagger.params.id.value );
    return;
  }

  // 2 - Check if the source asset exists
  Asset.findById(req.swagger.params.id.value, function (err, a) {
    if(err){
      res.status(500).json(err);
    }
    else {
      if(a===null){
        resNotFound(res,"No se encontró ningun activo con el id " + req.swagger.params.id.value );
        return;
      }

  // 3 - Find relations
      Relation.find({assetId: req.swagger.params.id.value, deleted:false}, function (err, relations) {
        if(err){
          res.status(500).json(err);
        }
        else {
          var response = [];
          for (var i = 0; i < relations.length; i++) {
            response.push(relations[i].toJSON());
            delete response[i].deleted;
            delete response[i].assetId;
            response[i].id = response[i]._id;
            delete response[i]._id;
          }
          console.log(response);
          res.status(200).json(response);
        }
      });
    }
  });
}

function relationIdGet(req, res) {
  // 1 - Check if the source asset id provided is valid
  if (!req.swagger.params.id.value.match(/^[0-9a-fA-F]{24}$/)){
    resNotFound(res,"No se encontró ningun activo con id " + req.swagger.params.id.value );
    return;
  }

  // 2 - Check if the relation id provided is valid
  if (!req.swagger.params.relId.value.match(/^[0-9a-fA-F]{24}$/)){
    resNotFound(res,"No se encontró ningun activo con el id " + req.swagger.params.relId.value);
    return;
  }

  // 3 - Check if the source asset exists
  Asset.findById(req.swagger.params.id.value, function (err, a) {
    if(err){
      res.status(500).json(err);
    }
    else {
      if(a===null){
        resNotFound(res,"No se encontró ningun activo con el id " + req.swagger.params.id.value );
        return;
      }
    }

  // 4 - Find the relation by ID
    Relation.findById(req.swagger.params.relId.value, function (err, relation) {
      if(err){
        res.status(500).json(err);
      }
      else {
        if(relation===null){
          resNotFound(res,"No se encontró ninguna relación con el id " + req.swagger.params.relId.value );
          return;
        }
        else {
          var response = relation.toJSON();
          delete response.assetId;
          res.status(200).json(response);
        }
      }
    });
  });
}

function relationPut(req, res) {
  // 1 - Check if the source asset id provided is valid
  if (!req.swagger.params.id.value.match(/^[0-9a-fA-F]{24}$/)){
    resNotFound(res,"No se encontró ningun activo con id " + req.swagger.params.id.value );
    return;
  }

  // 2 - Check if the relation id provided is valid
  if (!req.swagger.params.relId.value.match(/^[0-9a-fA-F]{24}$/)){
    resNotFound(res,"No se encontró ningun activo con el id " + req.swagger.params.relId.value);
    return;
  }

  // 3 - Check if the source asset exists
  Asset.findById(req.swagger.params.id.value, function (err, a) {
    if(err){
      res.status(500).json(err);
    }
    else {
      if(a===null){
        resNotFound(res,"No se encontró ningun activo con el id " + req.swagger.params.id.value );
        return;
      }

      // 4 - Find the relation by ID
      Relation.findById(req.swagger.params.relId.value, function (err, relation) {
        if(err){
          res.status(500).json(err);
        }
        else {
          if(relation===null){
            resNotFound(res,"No se encontró ninguna relación con el id " + req.swagger.params.relId.value );
            return;
          }
          else {
            // 6 - Update the relation data
            Util.cleanResource(req.body);
            Util.extend(relation, req.body);
            relation.save(function (err) {
              if(err){
                res.status(500).json(err);
              }
              else {
                var response = {
                  code: 200,
                  message: 'Relación actualizada con éxito'
                };
                res.status(200).json(response);
              }
            });
          }
        }
      });
    }
  });
}

function relationDelete(req, res) {
  // 1 - Check if the source asset id provided is valid
  if (!req.swagger.params.id.value.match(/^[0-9a-fA-F]{24}$/)){
    resNotFound(res,"No se encontró ningun activo con id " + req.swagger.params.id.value );
    return;
  }

  // 2 - Check if the relation id provided is valid
  if (!req.swagger.params.relId.value.match(/^[0-9a-fA-F]{24}$/)){
    resNotFound(res,"No se encontró ningun activo con el id " + req.swagger.params.relId.value);
    return;
  }
  // 3 - Check if the source asset exists
  Asset.findById(req.swagger.params.id.value, function (err, a) {
    if(err){
      res.status(500).json(err);
    }
    else {
      if(a===null){
        resNotFound(res,"No se encontró ningun activo con el id " + req.swagger.params.id.value );
        return;
      }
    }
  // 4 - Find the relation by ID
    Relation.findById(req.swagger.params.relId.value, function (err, relation) {
      if(err){
        res.status(500).json(err);
      }
      else {
        if(relation===null){
          resNotFound(res,"No se encontró ninguna relación con el id " + req.swagger.params.relId.value );
          return;
        }
        else {
          relation.deleted = true;
          relation.save(function (err) {
            if (err) {
              res.status(500).json(err);
            } else {
              var response = {code:200, message:"La relacion ha sido eliminada correctamente."};
              res.status(200).json(response);
            }
          });
        }
      }
    });
  });
}

module.exports = {
  relationGet: relationGet,
  relationIdGet: relationIdGet,
  relationPost: relationPost,
  relationPut: relationPut,
  relationDelete: relationDelete
};
