'use strict';

var User     = require('../models/user');
var NewUser  = require('../models/newUser');

exports.usersGet = function(args, res, next) {
  /**
  * parameters expected in the args:
  **/

  var examples = {};

  examples['application/json'] = [ {
    "deleted" : true,
    "name" : "aeiou",
    "comment" : "aeiou",
    "links" : [ {
      "rel" : "aeiou",
      "href" : "aeiou"
    } ],
    "id" : "aeiou"
  } ];



  if(Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  }
  else {
    res.end();
  }


}
exports.usersPost = function(args, res, next) {
  /**
  * parameters expected in the args:
  * user (NewUser)
  **/

  var examples = {};
  console.log(args.user.value.name);
  console.log(args.user.value.comment);


  res.end();
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
