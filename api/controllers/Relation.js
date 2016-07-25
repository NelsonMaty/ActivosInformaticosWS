'use strict';

var Relation = require('../models/Relation');
var RelationType  = require('../models/RelationType');
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

function formatRelations(rels, isIncoming) {
  var relations = [];
  rels.forEach(function (rel) {
    rel = rel.toObject();
    rel.outLabel = rel.relationTypeId.outLabel;
    rel.inLabel = rel.relationTypeId.inLabel;
    delete rel.relationTypeId;
    if(isIncoming){
      rel.relatedAssetId = rel.assetId;
    }
    delete rel.deleted;
    delete rel.isIncomingRel;
    delete rel.assetId;
    delete rel.counterRelation;
    delete rel.__v;
    delete rel.isCritical;
    delete rel._id;
    relations.push(rel);
  });
  return relations;
}

function buildTree(rootId, depth, resolve, reject) {
  // 1 Response tree base structure.
  var tree = {
    id: rootId
  };
  tree.relations = [];
  tree.incomingRelations = [];

  // 2 - Find asset (tree root) using the id provided
  Asset.findById(rootId)
  .populate("typeId", "name")
  .exec(function (err, a) {
    if(err){
      reject({code:500, message: err});
      return;
    }
  // 3 - Check if the source asset exists
    if(a===null){
      reject({code:404, message:"No se encontró ningun activo con el id " + rootId});
      return;
    }
    tree = formatNode(a);

    if(depth === 0){
      resolve(tree);
      return;
    }

  // 4 - Get outgoing relations
    Relation.find({assetId:tree._id, isIncomingRel:false, deleted:false})
    .populate({path:"relationTypeId"})
    .exec(function(err, rels){
      if(err){
        reject({code:500, message: err});
        return;
      }
      tree.relations = formatRelations(rels, false);
      var relationsPromises = [];
      for (var i = 0; i < tree.relations.length; i++) {
        relationsPromises.push(
          new Promise(function (resolve, reject) {
            buildTree(tree.relations[i].relatedAssetId, depth - 1, resolve, reject);
          })
        );
      }
      Promise.all(relationsPromises).then(
        function (responses) {
          for (var i = 0; i < tree.relations.length; i++) {
            delete tree.relations[i].relatedAssetId;
            tree.relations[i].relatedAsset = responses[i];
          }
  // 5 - Get incoming relations
          Relation.find({relatedAssetId:tree._id, isIncomingRel:false, deleted:false})
          .populate({path:"relationTypeId"})
          .exec(function (err, incomRels) {
            if(err){
              reject({code:500, message: err});
              return;
            }
            console.log(incomRels);
            tree.incomingRelations = formatRelations(incomRels, true);
            relationsPromises = [];
            for(i = 0; i < tree.incomingRelations.length; i++){
              relationsPromises.push(
                new Promise(function (resolve, reject) {
                  buildTree(tree.incomingRelations[i].relatedAssetId, depth - 1, resolve, reject);
                })
              );
            }
            Promise.all(relationsPromises).then(
              function (responses) {
                for (var i = 0; i < tree.incomingRelations.length; i++) {
                  delete tree.incomingRelations[i].relatedAssetId;
                  tree.incomingRelations[i].relatedAsset = responses[i];
                }
                resolve(tree);
              });
          });
        }
      );
    });
  });
}

// Relations tree function
function relationsTreeGet(req, res) {

  var depth;

  // How deep the relation graph should go?
  if(req.swagger.params.depth.value){
    depth = req.swagger.params.depth.value;
  }
  // Default case
  else {
    depth = 1;
  }

  // Check if the source asset id provided is valid
  if (!req.swagger.params.id.value.match(/^[0-9a-fA-F]{24}$/)){
    resNotFound(res,"No se encontró ningun activo con id " + req.swagger.params.id.value );
    return;
  }

  var promise = new Promise(function(resolve, reject) {
    buildTree(req.swagger.params.id.value, depth, resolve, reject);
  });

  promise.then(function (tree) {
    // tree was built successfully
    res.status(200).json(tree);
  }, function (err) {
    // the tree couldnt be built
    res.status(err.code).json(err);
    return;
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
