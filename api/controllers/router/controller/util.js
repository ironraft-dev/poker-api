"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.safeUpdate = safeUpdate;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _log = _interopRequireDefault(require("../../skeleton/log"));

var debuger = new _log["default"]();
debuger.tag = "Util";

function safeUpdate(record, key, value) {
  var type = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "string";
  var data = (0, _typeof2["default"])(value) == type ? value : value[key];
  if (data === null) return;
  if (data === undefined) return;
  if (isNaN(data)) return;
  if ((0, _typeof2["default"])(data) != type) throw new Error("invalid data [" + key + "] -> " + type);
  record[key] = data;
  debuger.log(record[key], "record[key]");
}