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
debuger.tag = "PUT";
router.use(function (req, res, next) {
  if (req.method != debuger.tag) {
    next();
    return;
  }

  next();
});
router.put('/ranks/add/:serverId', function (req, res, next) {
  return Rank.addRank(req, res, next);
});
router.put('/users/:userId', function (req, res, next) {
  return User.update(req, res, next);
});
router.put('/users/updatebank/:userId', function (req, res, next) {
  return User.updateBank(req, res, next);
});
router.put('/users/update/:serverId', function (req, res, next) {
  return User.updateValues(req, res, next);
});
router.put('/users/changebank/:serverId', function (req, res, next) {
  return User.changeBanks(req, res, next);
});
var _default = router;
exports["default"] = _default;