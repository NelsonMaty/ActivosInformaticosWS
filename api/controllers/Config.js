'use strict';

function getDataTypes(req, res) {
  var types = ["String","Boolean", "List","Integer", "Float", "Date"];
  res.status(200).send(types);
}

module.exports = {
  getDataTypes: getDataTypes
};
