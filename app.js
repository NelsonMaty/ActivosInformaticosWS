'use strict';

var SwaggerExpress = require('swagger-express-mw');
var SwaggerUi = require('swagger-tools/middleware/swagger-ui');

var app = require('express')();
var mongoose   = require('mongoose');
mongoose.connect('mongodb://mongo@127.0.0.1:27017/itam');

var open = require('open');

module.exports = app; // for testing

var config = {
  appRoot: __dirname // required config
};

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) {throw err; }

  // add swagger-ui
  app.use(SwaggerUi(swaggerExpress.runner.swagger));

  // install middleware
  swaggerExpress.register(app);

  var port = process.env.PORT || 10010;
  app.listen(port);
  console.log("Corriendo web service para activos informáticos.");
  console.log("Documentación de la API disponible en http://localhost:10010/docs/");
  open('http://localhost:10010/docs/');

});
