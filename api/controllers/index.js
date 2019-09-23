"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _app = _interopRequireDefault(require("../../app"));

var _log = _interopRequireDefault(require("./skeleton/log"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _methodOverride = _interopRequireDefault(require("method-override"));

var _get = _interopRequireDefault(require("./router/get"));

var _post = _interopRequireDefault(require("./router/post"));

var _put = _interopRequireDefault(require("./router/put"));

var _del = _interopRequireDefault(require("./router/del"));

var _cors = _interopRequireDefault(require("cors"));

var OrientDB = _interopRequireWildcard(require("./orient/db"));

var Setup = _interopRequireWildcard(require("./orient/setup"));

var Res = _interopRequireWildcard(require("./router/controller/response"));

var Config = _interopRequireWildcard(require("./config"));

var debuger = new _log["default"]();
debuger.tag = "INDEX";
var corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE"
};

_app["default"].use((0, _cors["default"])(corsOptions));

_app["default"].use('/api', checkAuthorization);

_app["default"].use(_bodyParser["default"].urlencoded({
  extended: true
}));

_app["default"].use(_bodyParser["default"].json());

_app["default"].use((0, _methodOverride["default"])());

_app["default"].use('/api', _get["default"]);

_app["default"].use('/api', _put["default"]);

_app["default"].use('/api', _post["default"]);

_app["default"].use('/api', _del["default"]);

_app["default"].use(logErrors);

_app["default"].use(errorHandler);

function checkAuthorization(req, res, next) {
  debuger.log(req.method + " | " + req.originalUrl);
  if (Config.API_KEY === req.query.api_key) next();else {
    var response = new Res["default"]();
    response.code = Res.ResponseCode.UnauthorizedApiKey;
    response.message = 'API key is missing or invalid';
    var errorData = {
      statusCode: Res.StatusCode.Unauthorized,
      response: response
    };
    next(errorData);
  }
}

function logErrors(err, req, res, next) {
  debuger.error(err, req.method + " | " + req.originalUrl);
  next(err);
}

function errorHandler(err, req, res, next) {
  res.status(err.statusCode).json(err.response);
}

Setup.init();