'use strict';

var url = require('url');


var AssetType = require('./AssetTypeService');


module.exports.assetTypeGet = function assetTypeGet (req, res, next) {
  AssetType.assetTypeGet(req.swagger.params, res, next);
};

module.exports.assetTypePost = function assetTypePost (req, res, next) {
  AssetType.assetTypePost(req.swagger.params, res, next);
};
