'use strict';

exports.assetTypeGet = function(args, res, next) {
  /**
   * parameters expected in the args:
   **/

var examples = {};
  
  examples['application/json'] = [ {
  "name" : "aeiou",
  "id" : "aeiou",
  "fields" : [ {
    "name" : "aeiou",
    "type" : "aeiou"
  } ]
} ];
  

  
  if(Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  }
  else {
    res.end();
  }
  
  
}
exports.assetTypePost = function(args, res, next) {
  /**
   * parameters expected in the args:
   * assetType (NewAssetType)
   **/

var examples = {};
  

  
  res.end();
}
