'use strict';

var Person  = require('../models/Person.model');
var Asset  = require('../models/Asset.model');
var Util = require('./Util');

function mergeProperties(obj1,obj2){
    for (var attrname in obj2) { obj1[attrname] = obj2[attrname]; }
    return obj1;
}

function personsGet(req, res) {
  Person.find({deleted:false},'-__v -deleted',function (err, persons) {
    if(err){
      res.status(500).json(err);
    }
    else {
      res.status(200).json(persons);
    }
  });
}

function personPost(req, res) {

  var newPerson = new Person();
  newPerson.name = req.body.name;
  newPerson.email = req.body.email;
  newPerson.phone = req.body.phone;
  newPerson.comment = req.body.comment;
  newPerson.deleted = false;

  newPerson.save(function (err, person) {
    if(err){
      res.status(500).json(err);
    }
    else {
      var response = {code:201, id:person._id};
      res.location('/persons/' + person.id);
      res.status(201).json(response);
    }
  });
}

function personIdGet(req, res) {
  /**
  * parameters expected in the req:
  * id (String)
  **/
  if (req.swagger.params.id.value.match(/^[0-9a-fA-F]{24}$/)){
    Person.findById(req.swagger.params.id.value,function(err, person) {
      if (err){
        console.log(err);
        res.status(500).json(err);
      }
      else{
        if(person===null){
          var error = {
            code : 404,
            message : "Persona no encontrada"
          };
          res.status(404).json(error);
        }
        else {
          res.status(200).json(person);
        }
      }
    });
  }
  else {
    var error = {
      code : 404,
      message : "Usuario no encontrada"
    };
    res.status(404).json(error);
  }

}

function personIdPut(req, res) {
  // use our bear model to find the bear we want
  if (req.swagger.params.id.value.match(/^[0-9a-fA-F]{24}$/)) {
    Person.findById(req.swagger.params.id.value, function(err, person) {
      if (err){
        res.status(500).json(err);
      }
      else {
        if(person === null){
          var error = {
            code : 404,
            message : "Persona no encontrada"
          };
          res.status(404).json(error);
          return;
        }
        else {
          person = mergeProperties(person, req.swagger.params.person.value);
          // save the person
          person.save(function(err) {
            if (err){
              res.status(500).json(err);
            }
            else {
              var response = {
                code: 200,
                message: 'Persona actualizada con éxito'
              };
              res.status(200).json(response);
            }
          });
        }
      }
    });
  }
  else {
    var error = {
      code : 404,
      message : "Persona no encontrada"
    };
    res.status(404).json(error);
  }
}

function personIdDelete(req, res) {
  /**
  * parameters expected in the req:
  * id (String)
  **/
  if (req.swagger.params.id.value.match(/^[0-9a-fA-F]{24}$/)) {
    Person.findById(req.swagger.params.id.value, function(err, person) {

      if (err){
        res.status(500).json(err);
      }
      else {
        if(person===null){
          var error = {
            code : 404,
            message : "Persona no encontrada"
          };
          res.status(404).json(error);
        }
        else {
          person.deleted = true;
          // save the person
          person.save(function(err) {
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
                message: 'Persona eliminada con éxito'
              };
              res.status(200).json(response);
            }
          });
        }
      }
    });
  }
  else {
    var error = {
      code : 404,
      message : "Persona no encontrada"
    };
    res.status(404).json(error);
  }
}

function personGetAssets(req, res) {
  if (!req.swagger.params.id.value.match(/^[0-9a-fA-F]{24}$/)){
    var error = {
      code : 404,
      message : "Persona no encontrada"
    };
    res.status(404).json(error);
    return;
  }
  Person.findById(req.swagger.params.id.value,function(err, person) {
    if (err){
      console.log(err);
      res.status(500).json(err);
      return;
    }
    if(person===null){
      var error = {
        code : 404,
        message : "Persona no encontrada"
      };
      res.status(404).json(error);
      return;
    }
    Asset.find({"stakeholders":{$elemMatch:{personId:req.swagger.params.id.value}}, deleted:false},
      function (err, assets) {
        if(err){
          res.status(500).json(err);
          return;
        }
        var response = [];
        for (var i = 0; i < assets.length; i++) {
          for (var j = 0; j < assets[i].stakeholders.length; j++) {
            if(assets[i].stakeholders[j].personId == req.swagger.params.id.value){
              response.push(
                {
                  asset:assets[i].toJSON(),
                  role:assets[i].stakeholders[j].role
                }
              );
              response[response.length-1].asset = Util.extend(response[response.length-1].asset, response[response.length-1].asset.value);
              delete response[response.length-1].asset.value;
            }
          }
        }
        res.status(200).json(response);
    });
  });
}

module.exports = {
  personsGet: personsGet,
  personPost: personPost,
  personIdGet: personIdGet,
  personIdDelete: personIdDelete,
  personIdPut: personIdPut,
  personGetAssets: personGetAssets
};
