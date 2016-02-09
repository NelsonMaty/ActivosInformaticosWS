'use strict';

var User  = require('../models/User');

/*
Once you 'require' a module you can reference the things that it exports.  These are defined in module.exports.

For a controller in a127 (which this is) you should export the functions referenced in your Swagger document by name.

Either:
- The HTTP Verb of the corresponding operation (get, put, post, delete, etc)
- Or the operationId associated with the operation in your Swagger document

In the starter/skeleton project the 'get' operation on the '/hello' path has an operationId named 'hello'.  Here,
we specify that in the exports of this module that 'hello' maps to the function named 'hello'
*/
module.exports = {
  usersGet: usersGet,
  usersPost: usersPost,
  usersIdGet: usersIdGet,
  usersIdDelete: usersIdDelete,
  usersIdPut: usersIdPut
};

/*
Functions in a127 controllers used for operations should take two parameters:

Param 1: a handle to the request object
Param 2: a handle to the response object
*/
function usersGet(req, res) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  User.find({deleted:false},function (err, users) {
    if(err)
      res.status(500).json(err)
    else {
      res.status(200).json(users);
    }
  })
}

function usersPost(req, res) {
  /**
  * parameters expected in the req:
  * user (User)
  **/

  var newUser = new User()
  newUser.name = req.body.name;
  newUser.comment = req.body.comment;
  newUser.deleted = false;

  newUser.save(function (err, user) {
    if(err)
    res.status(500).json(err);
    else {
      var response = {code:201, id:user._id};
      res.location('/users/' + user.id);
      res.status(201).json(response);
    }
  })
}

function usersIdGet(req, res) {
  /**
  * parameters expected in the req:
  * id (String)
  **/
  if (req.swagger.params.id.value.match(/^[0-9a-fA-F]{24}$/)){
    User.findById(req.swagger.params.id.value, function(err, user) {
      if (err){
        console.log(err);
        res.status(500).json(err);
      }
      else{
        if(user==null){
          var error = {
            code : 404,
            message : "Usuario no encontrado"
          }
          res.status(404).json(error)
        }
        else {
          res.status(200).json(user);
        }
      }
    });
  }
  else {
    var error = {
      code : 404,
      message : "Usuario no encontrada"
    }
    res.status(404).json(error)
  }

}

function usersIdPut(req, res) {
  // use our bear model to find the bear we want
  if (req.swagger.params.id.value.match(/^[0-9a-fA-F]{24}$/)) {

    User.findById(req.swagger.params.id.value, function(err, user) {

      if (err){
        res.status(500).json(err);
      }
      else {
        if(user == null){
          var error = {
            code : 404,
            message : "Usuario no encontrada"
          }
          res.status(404).json(error)
        }
        else {
          user = mergeProperties(user, req.swagger.params.user.value);
          // save the user
          user.save(function(err) {
            if (err){
              res.status(500).json(err);
            }
            else {
              var response = {
                code: 200,
                message: 'Usuario actualizado con éxito'
              }
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
      message : "Usuario no encontrada"
    }
    res.status(404).json(error)
  }
}

function usersIdDelete(req, res) {
  /**
  * parameters expected in the req:
  * id (String)
  **/
  if (req.swagger.params.id.value.match(/^[0-9a-fA-F]{24}$/)) {
    User.findById(req.swagger.params.id.value, function(err, user) {

      if (err){
        res.status(500).json(err);
      }
      else {
        if(user==null){
          var error = {
            code : 404,
            message : "Usuario no encontrada"
          }
          res.status(404).json(error)
        }
        else {
          user.deleted = true;
          // save the user
          user.save(function(err) {
            if (err){
              console.log(err);
              var error = {
                code : 500,
                message : "Error en la base de datos"
              }
              res.status(500).json(error)
            }
            else {
              var response = {
                code: 200,
                message: 'Usuario eliminado con éxito'
              }
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
      message : "Usuario no encontrada"
    }
    res.status(404).json(error)
  }
}

function mergeProperties(obj1,obj2){
    for (var attrname in obj2) { obj1[attrname] = obj2[attrname]; }
    return obj1;
}
