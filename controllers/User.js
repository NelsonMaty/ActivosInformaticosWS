'use strict';

var url = require('url');


var User = require('./UserService');


module.exports.usersGet = function usersGet (req, res, next) {
  User.usersGet(req.swagger.params, res, next);
};

module.exports.usersPost = function usersPost (req, res, next) {
  User.usersPost(req.swagger.params, res, next);
};

module.exports.usersIdGet = function usersIdGet (req, res, next) {
  User.usersIdGet(req.swagger.params, res, next);
};

module.exports.usersIdPut = function usersIdPut (req, res, next) {
  User.usersIdPut(req.swagger.params, res, next);
};

module.exports.usersIdDelete = function usersIdDelete (req, res, next) {
  User.usersIdDelete(req.swagger.params, res, next);
};
