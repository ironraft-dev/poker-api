"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;
exports.createRankInfo = createRankInfo;

var OrientDB = _interopRequireWildcard(require("./db"));

var _log = _interopRequireDefault(require("../skeleton/log"));

var debuger = new _log["default"]();
debuger.tag = "DB Setup";

function init() {
  createUserClass();
  createRank();
}

function createUserClass() {
  OrientDB.db["class"].create(OrientDB.Class.User).then(function (User) {
    debuger.log('created User');
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
      name: 'getBank',
      type: 'Double'
    }, {
      name: 'rank',
      type: 'Double'
    }, {
      name: 'character',
      type: 'String'
    }, {
      name: 'rankId',
      type: 'String'
    }]).then(function (property) {
      debuger.log(property, 'setup User');
      OrientDB.db.index.create({
        name: OrientDB.Index.User,
        type: 'unique'
      }).then(function (index) {
        return debuger.log('created User Index');
      }, function (error) {
        return debuger.error(error.message, 'created User Index');
      });
    });
  }, function (error) {
    return debuger.error(error.message, 'created User');
  });
}

function createRank() {
  OrientDB.db["class"].create(OrientDB.Class.RankInfo).then(function (RankInfo) {
    RankInfo.property.create([{
      name: 'bankMin',
      type: 'Double'
    }, {
      name: 'groupId',
      type: 'String'
    }, {
      name: 'status',
      type: 'Integer'
    }]).then(function (property) {
      debuger.log(property, 'setup RankInfo');
      createRankInfo("0");
      createRankInfo("1");
      createRankInfo("2");
    });
  }, function (error) {
    return debuger.error(error.message, 'created Rank');
  });
}

function createRankInfo(id) {
  OrientDB.db["class"].get(OrientDB.Class.RankInfo).then(function (RankInfo) {
    RankInfo.create({
      groupId: id,
      bankMin: 0,
      status: 0
    }).then(function (rankInfo) {
      addRankClass(id);
    }, function (error) {
      return debuger.error(error.message, 'created RankInfo');
    });
  }, function (error) {
    return debuger.error(error.message, 'created RankInfo');
  });
}

function addRankClass(id) {
  var className = OrientDB.Class.Rank + id;
  OrientDB.db["class"].create(className).then(function (Rank) {
    debuger.log('created ' + className);
    Rank.property.create([{
      name: 'userId',
      type: 'String'
    }, {
      name: 'profileImg',
      type: 'String'
    }, {
      name: 'name',
      type: 'String'
    }, {
      name: 'character',
      type: 'String'
    }, {
      name: 'bank',
      type: 'Double'
    }]).then(function (property) {
      debuger.log(property, 'setup Rank');
      OrientDB.db.index.create({
        name: className + OrientDB.Index.RankId,
        type: 'unique'
      }).then(function (index) {
        return debuger.log('created ' + className + ' Index');
      }, function (error) {
        return debuger.error(error.message, 'created ' + className + ' Index');
      });
    });
  }, function (error) {
    return debuger.error(error.message, 'created ' + className);
  });
}

function setupRankInfo(RankInfo) {}