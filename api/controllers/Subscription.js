'use strict';

var Subscription  = require('../models/Subscription.model');
var ObjectId = require('mongoose').Types.ObjectId;
var Asset  = require('../models/Asset.model');

var urlExpression = new RegExp('^(?:(?:http|https)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$', 'i');


function assetSubscriptionPost(req, res) {
  var error = {};

  // 1 - Check if the asset id is valid
  if (!req.swagger.params.id.value.match(/^[0-9a-fA-F]{24}$/)){
    error = {
      code : 404,
      message : "Activo no encontrado"
    };
    res.status(404).json(error);
    return;
  }

  // 2 - Check if the asset exists
  Asset.findById(req.swagger.params.id.value,function (err, asset) {
    if(err){
      res.status(500).json(err);
      return;
    }
    if(asset===null){
      error = {
        code : 404,
        message : "Activo no encontrado"
      };
      res.status(404).json(error);
      return;
    }
    // 3 - Build new Subscription object
    var newSubscription = new Subscription();
    newSubscription.assetId = new ObjectId(req.swagger.params.id.value);
    newSubscription.events = [];
    for (var i = 0; i < req.body.events.length; i++) {
      switch (req.body.events[i]) {
        case 'LIFE_CYCLE':
        case 'DELETED':
          newSubscription.events.push(req.body.events[i]);
      }
    }

    // 4 - Check if the Subscription has valid events
    if(newSubscription.events.length === 0){
      error = {
        code : 422,
        message : "No se encontraron tipos de eventos válidos en la subscripción"
      };
      res.status(422).json(error);
      return;
    }

    // 5 - Check if the url is valid
    if (!req.body.urlCallback.match(urlExpression)){
      error = {
        code : 422,
        message : "La url provista no es válida."
      };
      res.status(422).json(error);
      return;
    }
    newSubscription.callbackUrl = req.body.urlCallback;

    // 6 - Check if the subscrition was already created
    Subscription.find({assetId: new ObjectId(req.swagger.params.id.value), callbackUrl: req.body.urlCallback})
    .lean(false)
    .exec(function (err, subscritions) {
      if(err){
        res.status(500).json(err);
        return;
      }
      if(subscritions.length !== 0){
        error = {
          code : 403,
          message : "La suscripción ya existe"
        };
        res.status(403).json(error);
        return;
      }

      // 6 - Save the Subscription
      newSubscription.save(function (err, sub) {
        if(err){
          res.status(500).json(err);
          return;
        }
        var response = {code:201};
        res.status(201).json(response);
      });
    });
  });
}

module.exports = {
  assetSubscriptionPost: assetSubscriptionPost
};
