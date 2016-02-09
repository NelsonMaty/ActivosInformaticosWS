'use strict';

var AssetType  = require('../models/AssetType');

module.exports = {
  atGet: atGet,
  atPost: atPost,
  atIdGet: atIdGet
};

function atGet(req, res) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  AssetType.find(function (err, ats) {
    if(err)
      res.status(500).json(err);
    else {
      res.status(200).json(ats);
    }
  })
}

function atPost(req, res) {
  /**
  * parameters expected in the req:
  * at (AssetType)
  **/

  var newAT = new AssetType()
  newAT.name = req.body.name;
  newAT.comment = req.body.comment;
  newAT.properties = req.body.properties;

  newAT.save(function (err, at) {
    if(err){
      console.log(err);
      res.status(500).json(err);
    }
    else {
      var response = {code:201, id:at._id};
      res.location('/assetTypes/' + at.id);
      res.status(201).json(response);
    }
  })
}

function atIdGet(req, res) {
  /**
  * parameters expected in the req:
  * id (String)
  **/
  if (req.swagger.params.id.value.match(/^[0-9a-fA-F]{24}$/)){
    AssetType.findById(req.swagger.params.id.value, function(err, at) {
      if (err){
        console.log(err);
        res.status(500).json(err);
      }
      else{
        if(at==null){
          var error = {
            code : 404,
            message : "Tipo de activo no encontrado"
          }
          res.status(404).json(error)
        }
        else {
          res.status(200).json(at);
        }
      }
    });
  }
  else {
    var error = {
      code : 404,
      message : "Tipo de activo no encontrada"
    }
    res.status(404).json(error)
  }

}
