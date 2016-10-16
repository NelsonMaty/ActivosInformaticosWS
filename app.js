'use strict';

var SwaggerExpress = require('swagger-express-mw');
var SwaggerUi = require('swagger-tools/middleware/swagger-ui');

var app = require('express')();
var mongoose   = require('mongoose');

var config = require(process.env.CONF||'/etc/nodejs-config/itam.json');
var connectionString = 'mongodb://' + config.mongodb.user + '@' + config.mongodb.host + ':' + config.mongodb.port + '/' + config.mongodb.dbname;
mongoose.connect(connectionString);

module.exports = app; // for testing

var swaggerConfig = {
  appRoot: __dirname // required config
};

SwaggerExpress.create(swaggerConfig, function(err, swaggerExpress) {
  if (err) {throw err; }

  // add swagger-ui
  app.use(SwaggerUi(swaggerExpress.runner.swagger));

  // install middleware
  swaggerExpress.register(app);

  var port = config.port;
  app.listen(port);
  console.log("Corriendo web service para activos informáticos.");
  console.log("Documentación de la API disponible en http://localhost:" + port + "/docs/");

});
