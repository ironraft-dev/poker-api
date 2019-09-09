"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.log = _log;
exports["default"] = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var colors = require('colors');

var IS_DEBUG = true;
var IS_WARNNING = true;
var DEBUG_LEVEL = 1;
var DEBUG_TAG = '';
colors.setTheme({
  prompt: 'grey',
  info: 'green',
  warn: 'yellow',
  log: 'white',
  error: 'red'
});

var Debugger =
/*#__PURE__*/
function () {
  function Debugger() {
    (0, _classCallCheck2["default"])(this, Debugger);
    this.tag = '';
  }

  (0, _createClass2["default"])(Debugger, [{
    key: "info",
    value: function info(value) {
      var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

      _log(this.tag, 'info', value, key);
    }
  }, {
    key: "log",
    value: function log(value) {
      var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      var level = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
      if (!IS_DEBUG) return;
      if (DEBUG_LEVEL > level) return;
      if (DEBUG_TAG != "" && DEBUG_TAG != this.tag) return;

      _log(this.tag, 'log', value, key);
    }
  }, {
    key: "error",
    value: function error(value) {
      var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

      _log(this.tag, 'error', value, key);
    }
  }, {
    key: "warn",
    value: function warn(value) {
      var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      if (!IS_WARNNING) return;

      _log(this.tag, 'warn', value, key);
    }
  }]);
  return Debugger;
}();

exports["default"] = Debugger;

function _log(tag, debugType, value) {
  var key = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
  var type = (0, _typeof2["default"])(value);
  var header = '[' + tag + ']' + (key != '' ? " " + key : "") + ' -> ';

  if (type == 'object') {
    console[debugType](header.prompt + " [" + Date.now().toString() + "]");
    console.dir(value);
  } else {
    console[debugType](header.prompt + String(value)[debugType] + " [" + Date.now().toString() + "]");
  }
}