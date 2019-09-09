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

var Rank = _interopRequireWildcard(require("./controller/rank"));

var router = _express["default"].Router();

var debuger = new _log["default"]();
debuger.tag = "GET";
router.use(function (req, res, next) {
  if (req.method != debuger.tag) {
    next();
    return;
  }

  next();
});
router.get('/ranks/', function (req, res, next) {
  return Rank.lists(req, res, next);
});
router.get('/ranks/reset/:serverId', function (req, res, next) {
  return Rank.reset(req, res, next);
});
router.get('/ranks/sync/:serverId', function (req, res, next) {
  return Rank.sync(req, res, next);
});
router.get('/users/', function (req, res, next) {
  return User.lists(req, res, next);
});
router.get('/users/:userId', function (req, res, next) {
  if (req.query.rid != undefined) User.record(req, res, next);else User.list(req, res, next);
});
var _default = router;
exports["default"] = _default;