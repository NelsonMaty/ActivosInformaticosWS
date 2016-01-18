'use strict';

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
      res.statusCode = 201;
      res.end(null);
    }
  })
}
exports.usersIdGet = function(args, res, next) {
  /**
  * parameters expected in the args:
  * id (String)
  **/

  User.findById(args.id.value, function(err, user) {
    if (err)
      res.end(err);
    else{
      if(user==null){
        res.statusCode = 404;
        res.end();
      }
      else {
        res.end(JSON.stringify(user));
      }
    }
  });

}
exports.usersIdPut = function(args, res, next) {
  // use our bear model to find the bear we want
  User.findById(args.id.value, function(err, user) {

    if (err)
      res.send(err);
    else {
      if(!!args.user.value.name)
        user.name = args.user.value.name;  // update the bears info
      if(!!args.user.value.comment)
        user.comment = args.user.value.comment;  // update the bears info

      // save the user
      user.save(function(err) {
        if (err)
          res.send(err);
        else {
          res.statusCode = 204;
          res.end();
        }
      });
    }
  });
}
exports.usersIdDelete = function(args, res, next) {
  /**
  * parameters expected in the args:
  * id (String)
  **/

  User.findById(args.id.value, function(err, user) {

    if (err)
      res.send(err);

    else {
      user.deleted = true;
      // save the user
      user.save(function(err) {
        if (err)
          res.send(err);
        else {
          res.end(JSON.stringify(user));
        }
      });
    }
  });

  res.end();
}
