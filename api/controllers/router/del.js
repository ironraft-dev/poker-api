"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _log = _interopRequireDefault(require("../skeleton/log"));

var OrientDB = _interopRequireWildcard(require("../orient/db"));

var Res = _interopRequireWildcard(require("./controller/response"));

var Validation = _interopRequireWildcard(require("./controller/validation"));

var User = _interopRequireWildcard(require("./controller/user"));

var router = _express["default"].Router();

var debuger = new _log["default"]();
debuger.tag = "DELETE";
router.use(function (req, res, next) {
  if (req.method != debuger.tag) {
    next();
    return;
  }

  Validation.checkAccessToken(req.body.snsToken, function (validation) {
    if (validation === true) next();else next(Res.getAccessTokenError());
  });
});
router["delete"]('/users/:userId', function (req, res, next) {
  return User.remove(req, res, next);
});
var _default = router;
exports["default"] = _default;