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
debuger.tag = "POST";
router.use(function (req, res, next) {
  if (req.method != debuger.tag) {
    next();
    return;
  }

  Validation.checkAccessToken(req.body.snsToken, function (validation) {
    if (validation === true) next();else next(Res.getAccessTokenError());
  });
});
router.post('/users/:userId', function (req, res, next) {
  return User.create(req, res, next);
});
router.post('/users/autosign/:userId', function (req, res, next) {
  var response = new Res["default"]();
  OrientDB.db.index.get(OrientDB.Index.User).then(function (UserIdx) {
    UserIdx.get(req.params.userId).then(function (user) {
      if (user === undefined) User.create(req, res, next, response);else User.record(req, res, next, user.rid, response, Validation.getLoginToken());
    }, function (error) {
      next(Res.getBadRequestError(error, Res.ResponseCode.UndefinedKey, response));
    });
  }, function (error) {
    next(Res.getDBError(error, response));
  });
});
var _default = router;
exports["default"] = _default;