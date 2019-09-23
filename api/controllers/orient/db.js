"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.db = exports.Index = exports.Class = void 0;

var _orientjs = _interopRequireDefault(require("orientjs"));

var Config = _interopRequireWildcard(require("../config"));

var dbServer = (0, _orientjs["default"])({
  host: Config.host,
  port: Config.port,
  username: Config.ID,
  password: Config.PW
});
var Class = Object.freeze({
  User: "User",
  Rank: "Rank",
  RankInfo: "RankInfo"
});
exports.Class = Class;
var Index = Object.freeze({
  User: "User.id",
  UserToken: "User.snsToken",
  RankId: ".userId"
});
exports.Index = Index;
var db = dbServer.use(Config.DB_TABLE);
exports.db = db;