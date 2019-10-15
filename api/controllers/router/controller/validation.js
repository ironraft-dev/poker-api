"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkId = checkId;
exports.checkAuth = checkAuth;
exports.checkLoginToken = checkLoginToken;
exports.checkServerKey = checkServerKey;
exports.checkAccessToken = checkAccessToken;
exports.getLoginToken = getLoginToken;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var Config = _interopRequireWildcard(require("../../config"));

var _axios = _interopRequireDefault(require("axios"));

var _log = _interopRequireDefault(require("../../skeleton/log"));

var _v = _interopRequireDefault(require("uuid/v4"));

var debuger = new _log["default"]();
debuger.tag = "Validation";

function checkId(userId, currentUserid) {
  return userId === currentUserid;
}

function checkAuth(userId, currentUserid) {
  return userId === currentUserid;
}

function checkLoginToken(loginToken, currentLoginToken) {
  return loginToken === currentLoginToken;
}

function checkServerKey(serverId, serverKey) {
  return serverKey === Config.SERVER_KEY;
}

function checkAccessToken(_x, _x2) {
  return _checkAccessToken.apply(this, arguments);
}

function _checkAccessToken() {
  _checkAccessToken = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee(token, callback) {
    var response;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            debuger.log(token, "user token");
            _context.next = 4;
            return _axios["default"].get(Config.FACEBOOK_DEBUG_TOKEN_API, {
              params: {
                'input_token': Config.FACEBOOK_APP_TOKEN,
                'access_token': token
              }
            });

          case 4:
            response = _context.sent;
            debuger.log(response, "response");
            if (!response) callback(false);else callback(true);
            _context.next = 13;
            break;

          case 9:
            _context.prev = 9;
            _context.t0 = _context["catch"](0);
            debuger.log(_context.t0, "response");
            callback(false);

          case 13:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 9]]);
  }));
  return _checkAccessToken.apply(this, arguments);
}

function getLoginToken() {
  return (0, _v["default"])();
}