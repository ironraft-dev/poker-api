'use strict';

var SwaggerExpress = require('swagger-express-mw');
var SwaggerUi = require('swagger-tools/middleware/swagger-ui');
var app = require('express')();

module.exports = app; // for testing

var config = {
  appRoot: __dirname

};


SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }
  app.use(SwaggerUi(swaggerExpress.runner.swagger));
  swaggerExpress.register(app);
  var port = process.env.PORT || 2083;
  app.listen(port);
  console.log('SwaggerExpress start http://127.0.0.1:' + port + '/docs');

});
var _default = app;
exports["default"] = _default;
