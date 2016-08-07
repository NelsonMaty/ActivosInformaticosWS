'use strict';

var Role  = require('../models/Role.model');

function getRoles(req, res) {
  Role.find({},'-_id -__v',function (err, roles) {
    if(err){
      res.status(500).json(err);
    }
    else {
      res.status(200).json(roles);
    }
  });
}

function postRole(req, res) {
  Role.findOne({name: req.body.name},'-_id -__v', function (err, roleFound) {
    if(roleFound !== null){
      var response = {code:403, message:'El rol "'+req.body.name+'" ya existe.'};
      res.status(403).json(response);
      return;
    }
    var newRole = new Role();
    newRole.name = req.body.name;
    newRole.deleted = false;
    newRole.save(function (err, role) {
      if(err){
        console.log(err);
        res.status(500).json(err);
      }
      else {
        var response = {code:201, name:role.name};
        res.location('/roles/' + role.id);
        res.status(201).json(response);
      }
    });
  });
}

function roleIdGet(req, res) {
  Role.findOne({name:req.swagger.params.name.value},'-_id -__v', function(err, role) {
    if (err){
      console.log(err);
      res.status(500).json(err);
      return;
    }
    if(role===null){
      var error = {
        code : 404,
        message : "Rol no encontrado"
      };
      res.status(404).json(error);
      return;
    }
    res.status(200).json(role);
  });
}

function roleIdPut(req, res) {
  Role.findOne({name:req.swagger.params.name.value}, function(err, role) {
    if (err){
      console.log(err);
      res.status(500).json(err);
      return;
    }
    if(role===null){
      var error = {
        code : 404,
        message : "Rol no encontrado"
      };
      res.status(404).json(error);
      return;
    }
    role.name = req.body.name || req.swagger.params.name.value;
    role.deleted = req.body.deleted;
    role.save(function(err) {
      if (err){
        res.status(500).json(err);
      }
      else {
        var response = {
          code: 200,
          message: 'Rol actualizado con éxito'
        };
        res.status(200).json(response);
      }
    });
  });
}


function roleIdDelete(req, res) {
  Role.findOne({name:req.swagger.params.name.value}, function(err, role) {
    if (err){
      console.log(err);
      res.status(500).json(err);
      return;
    }
    if(role===null){
      var error = {
        code : 404,
        message : "Rol no encontrado"
      };
      res.status(404).json(error);
      return;
    }
    role.deleted = true;
    role.save(function(err) {
      if (err){
        res.status(500).json(err);
      }
      else {
        var response = {
          code: 200,
          message: 'Rol eliminado con éxito'
        };
        res.status(200).json(response);
      }
    });
  });
}

module.exports = {
  roleIdGet: roleIdGet,
  roleIdDelete: roleIdDelete,
  roleIdPut: roleIdPut,
  getRoles: getRoles,
  postRole: postRole
};
