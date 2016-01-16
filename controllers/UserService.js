'use strict';

// var User     = require('../models/user');
var User  = require('../models/User');

exports.usersGet = function(args, res, next) {
  /**
  * parameters expected in the args:
  **/

  User.find(function (err, users) {
    if(err)
      res.send(err)
    else {
      console.log(users);
      res.end(JSON.stringify(users || {}, null, 2));
    }
  })
}
exports.usersPost = function(args, res, next) {
  /**
  * parameters expected in the args:
  * user (User)
  **/

  var newUser = new User()
  newUser.name = args.user.value.name;
  newUser.comment = args.user.value.comment;
  newUser.deleted = false;

  newUser.save(function (err) {
    if(err)
      res.send(err);
    else {
      res.setHeader('Content-Type', 'application/json');
      console.log(newUser);
      res.end(null, 201);
    }
  })
}
exports.usersIdGet = function(args, res, next) {
  /**
  * parameters expected in the args:
  * id (String)
  **/

  var examples = {};

  examples['application/json'] = {
    "deleted" : true,
    "name" : "aeiou",
    "comment" : "aeiou",
    "links" : [ {
      "rel" : "aeiou",
      "href" : "aeiou"
    } ],
    "id" : "aeiou"
  };



  if(Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  }
  else {
    res.end();
  }


}
exports.usersIdPut = function(args, res, next) {
  /**
  * parameters expected in the args:
  * id (String)
  * user (UpdateUser)
  **/

  var examples = {};



  res.end();
}
exports.usersIdDelete = function(args, res, next) {
  /**
  * parameters expected in the args:
  * id (String)
  **/

  var examples = {};



  res.end();
}
