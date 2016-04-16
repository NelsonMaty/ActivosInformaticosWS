'use strict';

module.exports = {
  mergeProperties : mergeProperties,
  extend: extend,
  jsonToString: jsonToString,
  parseJSON: parseJSON,
  cleanResource: cleanResource
};

function cleanResource(resource) {
  delete resource._id;
  delete resource.__v;
}


function mergeProperties(obj1,obj2){
  for (var attrname in obj2) { obj1[attrname] = obj2[attrname]; }
  return obj1;
}


function extend(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || typeof add !== 'object') {
    console.log("Not an object type");
    return origin;
  }
  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};


function jsonToString(obj) {
  return JSON.stringify(obj, null, 4);
};

function parseJSON(val){

  try {

    var json = JSON.parse(val);

  } catch (ex) {

    return new Error("Json con error");
  }

  return json;
}
