'use strict';

var Relation = require('../models/Relation');
var RelationType  = require('../models/RelationType');
var Asset  = require('../models/Asset');
var AssetType  = require('../models/AssetType');


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
          return;
        }
        if(b===null){
          resNotFound(res,"No se encontró ningun activo con el id " + req.body.relatedAssetId );
          return;
        }
  // 5 - Check if the relation type exists
        RelationType.findById(req.body.relationTypeId, function(err, relType) {
          if (err){
            console.log(err);
            res.status(500).json(err);
            return;
          }
          if(relType===null){
            var error = {
              code : 404,
              message : "Tipo de relación no encontrado"
            };
            res.status(404).json(error);
            return;
          }
  // 6 - Create outgoing relation from source asset
          var newRelation = new Relation();
          newRelation.deleted = false;
          newRelation.assetId = req.swagger.params.id.value;
          newRelation.isIncomingRel = false;
          Util.extend(newRelation, req.body);

          newRelation.save(function (err,relation) {
            if(err){
              console.log(err);
              res.status(500).json(err);
              return;
            }
  // 7 - Create incoming relation to target asset
            var newRelation2 = new Relation();
            newRelation2.deleted = false;
            Util.extend(newRelation2, req.body);
            newRelation2.isIncomingRel = true;
            newRelation2.assetId = req.body.relatedAssetId;
            newRelation2.relatedAssetId = req.swagger.params.id.value;
            newRelation2.counterRelation = relation.id; // set counter relation 1

            newRelation2.save(function (err, relation2) {
              if(err){
                console.log(err);
                res.status(500).json(err);
                return;
              }
              newRelation.counterRelation = relation2.id; // set counter relation 2
              newRelation.save(function (err,relation) {
                if(err){
                  console.log(err);
                  res.status(500).json(err);
                  return;
                }
  // 8 - Response
                var response = {code:201, id:relation._id};
                res.location('/assets/' + req.swagger.params.id.value + '/relations/' + relation.id);
                res.status(201).json(response);
              });
            });
          });
        });
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
      Relation.find({assetId: req.swagger.params.id.value, deleted:false, isIncomingRel:false}, function (err, relations) {
        if(err){
          res.status(500).json(err);
        }
        else {
          var response = [];
          for (var i = 0; i < relations.length; i++) {
            response.push(relations[i].toJSON());
            delete response[i].deleted;
            delete response[i].assetId;
            delete response[i].isIncomingRel;
            response[i].id = response[i]._id;
            delete response[i]._id;
            delete response[i].counterRelation;
          }
          res.status(200).json(response);
        }
      });
    }
  });
}

function counterRelationGet(req, res) {

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
      Relation.find({assetId: req.swagger.params.id.value, deleted:false, isIncomingRel:true}, function (err, relations) {
        if(err){
          res.status(500).json(err);
        }
        else {
          var response = [];
          for (var i = 0; i < relations.length; i++) {
            response.push(relations[i].toJSON());
            delete response[i].deleted;
            delete response[i].assetId;
            delete response[i].isIncomingRel;
            delete response[i].counterRelation;
            response[i].id = response[i]._id;
            delete response[i]._id;
          }
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
          delete response.isIncomingRel;
          delete response.counterRelation;
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
        return;
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
              return;
            } else {
  // 5 - Delete counter relation
              Relation.findById(relation.counterRelation, function (err, relation2) {
                if (err) {
                  res.status(500).json(err);
                  return;
                }
                relation2.deleted = true;
                relation2.save(function (err) {
                  if (err) {
                    res.status(500).json(err);
                    return;
                  }
                  var response = {code:200, message:"La relacion ha sido eliminada correctamente."};
                  res.status(200).json(response);
                });
              });
            }
          });
        }
      }
    });
  });
}

function formatNode(node){
  if(typeof node.toObject === 'function') {
    node = node.toObject();
  }
  node.name = node.value.name;
  node.assetType = node.typeId;
  delete node.typeId;
  delete node.value;
  delete node.deleted;
  delete node.__v;
  return node;
}

function populateAssetType(relatedAsset) {
  AssetType.findById(relatedAsset.typeId, function (err, at) {
    if(err){
      return;
    }
    relatedAsset.typeId = at.toObject();
    relatedAsset = formatNode(relatedAsset);
    console.log(relatedAsset);
    return relatedAsset;
  });
}

function formatRelations(rels) {
  var relations = [];
  rels.forEach(function (rel) {
    rel = rel.toObject();
    rel.relationLabel = rel.relationTypeId.outLabel;
    delete rel.relationTypeId;
    rel.relatedAsset = formatNode(rel.relatedAssetId);
    rel.relatedAsset.relations = [];
    delete rel.relatedAssetId;
    delete rel.deleted;
    delete rel.isIncomingRel;
    delete rel.assetId;
    delete rel.counterRelation;
    delete rel.__v;
    delete rel.isCritical;
    delete rel._id;
    relations.push(rel);
  });
  // console.log(relations);
  return relations;
}

function relationsTreeGet(req, res) {
  var depth;
  if(!req.swagger.params.depth.value){
    depth = req.swagger.params.depth.value;
  }
  else {
    depth = 1;
  }
  // 1 - Check if the source asset id provided is valid
  if (!req.swagger.params.id.value.match(/^[0-9a-fA-F]{24}$/)){
    resNotFound(res,"No se encontró ningun activo con id " + req.swagger.params.id.value );
    return;
  }
  var tree = {
    id: req.swagger.params.id.value
  };
  tree.relations = [];

  // 2 - Find asset by provided id
  Asset.findById(req.swagger.params.id.value)
  .populate("typeId", "name")
  .exec(function (err, a) {
    if(err){
      res.status(500).json(err);
      return;
    }
  // 3 - Check if the source asset exists
    if(a===null){
      resNotFound(res,"No se encontró ningun activo con el id " + req.swagger.params.id.value );
      return;
    }
    tree = formatNode(a);
    Relation.find({assetId:a._id, isIncomingRel:false, deleted:false})
    .populate({path:"relatedAssetId relationTypeId", populate:{path:"typeId",model:"AssetType",select:"name"}})
    .exec(function(err, rels){
      console.log(JSON.stringify(rels, null, 4));
      tree.relations = formatRelations(rels);
      // console.log(rels.length);
    // console.log(JSON.stringify(tree, null, 4));
      res.status(200).json(tree);
    });
  });
}

module.exports = {
  relationGet: relationGet,
  relationIdGet: relationIdGet,
  relationPost: relationPost,
  relationPut: relationPut,
  relationDelete: relationDelete,
  counterRelationGet: counterRelationGet,
  relationsTreeGet: relationsTreeGet
};
