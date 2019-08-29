"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;
exports.index = index;

var OrientDB = _interopRequireWildcard(require("./db"));

var _log = _interopRequireDefault(require("../skeleton/log"));

var debuger = new _log["default"]();
debuger.tag = "DB Setup";

function init() {
  OrientDB.db["class"].create(OrientDB.Class.User).then(function (User) {
    debuger.log('created User');
    setupUser(User);
  }, function (error) {
    return debuger.error(error.message, 'created User');
  });
}

function index() {
  OrientDB.db.index.create({
    name: OrientDB.Index.User,
    type: 'unique'
  }).then(function (index) {
    return debuger.log('created User Index');
  }, function (error) {
    return debuger.error(error.message, 'created User Index');
  });
}

function setupUser(User) {
  User.property.create([{
    name: 'id',
    type: 'String'
  }, {
    name: 'profileImg',
    type: 'String'
  }, {
    name: 'name',
    type: 'String'
  }, {
    name: 'loginToken',
    type: 'String'
  }, {
    name: 'snsToken',
    type: 'String'
  }, {
    name: 'bank',
    type: 'Double'
  }, {
    name: 'rank',
    type: 'Double'
  }]).then(function (property) {
    debuger.log(property, 'setup User');
  });
}