"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lists = lists;
exports.reset = reset;
exports.sync = sync;
exports.addRank = addRank;
exports.RankUpdater = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _log = _interopRequireDefault(require("../../skeleton/log"));

var OrientDB = _interopRequireWildcard(require("../../orient/db"));

var Res = _interopRequireWildcard(require("./response"));

var Validation = _interopRequireWildcard(require("./validation"));

var Util = _interopRequireWildcard(require("./util"));

var Config = _interopRequireWildcard(require("../../config"));

var debuger = new _log["default"]();
debuger.tag = "User";
var RankGroupStatus = Object.freeze({
  Empty: 0,
  Full: 1
});
var LIMITED_RANKS_NUM = 10;

var RankUpdater =
/*#__PURE__*/
function () {
  function RankUpdater() {
    var _this = this;

    (0, _classCallCheck2["default"])(this, RankUpdater);
    this.rankInfos = [];
    OrientDB.db["class"].get(OrientDB.Class.RankInfo).then(function (RankInfo) {
      RankInfo.list().then(function (infos) {
        _this.rankInfos = infos;
        debuger.log("get rankInfos");
      });
    }, function (error) {
      return debuger.error("get rankInfos");
    });
  }

  (0, _createClass2["default"])(RankUpdater, [{
    key: "updateBank",
    value: function updateBank(user, changeBank) {
      var prevBank = user.getBank - changeBank;

      var compare = function compare(i) {
        if (i.status == RankGroupStatus.Empty) return true;
        return prevBank >= i.bankMin;
      };

      var prevInfo = this.rankInfos.find(compare);
      var info = this.rankInfos.find(compare);
      if (info == null && prevBank == null) return;
      if (info !== prevBank) this.removeRank(user, prevBank);
      this.addRank(user, prevBank);
    }
  }, {
    key: "addRank",
    value: function addRank(user, info) {
      var className = OrientDB.Class.Rank + info.groupId;
      OrientDB.db.index.get(className + OrientDB.Index.RankId).then(function (Rank) {
        Rank.get(req.params.userId).then(function (rank) {
          return update(rank, user);
        }, function (error) {
          return debuger.error(error, "addRank " + user.userId);
        });
      }, function (error) {
        create(user, info.groupId);
      });
    }
  }, {
    key: "removeRank",
    value: function removeRank(user, info) {
      var className = OrientDB.Class.Rank + info.groupId;
      OrientDB.db.index.get(className + OrientDB.Index.RankId).then(function (Rank) {
        Rank.get(req.params.userId).then(function (rank) {
          return remove(rank);
        }, function (error) {
          return debuger.error(error, "removeRank " + user.userId);
        });
      }, function (error) {
        return debuger.error(error, "removeRank " + user.userId);
      });
    }
  }]);
  return RankUpdater;
}();

exports.RankUpdater = RankUpdater;

function lists(req, res, next) {
  var response = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : new Res["default"]();
  var className = OrientDB.Class.Rank + req.query.groupId;
  OrientDB.db["class"].get(className).then(function (Rank) {
    Rank.list().then(function (ranks) {
      response.code = Res.ResponseCode.Success;

      var compare = function compare(a, b) {
        return a.bank < b.bank;
      };

      ranks.sort(compare);
      response.data = ranks;
      res.status(Res.StatusCode.Success).json(response);
    });
  }, function (error) {
    return next(Res.getDBError(error, response));
  });
}

var updater = new RankUpdater();

function reset(req, res, next) {
  var response = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : new Res["default"]();
  var validation = Validation.checkServerKey(req.params.serverId, req.headers.serverkey);

  if (validation === false) {
    next(Res.getValidationError(Res.ResponseCode.ValidationServerKey, response));
    return;
  }

  updater = new RankUpdater();
  response.code = Res.ResponseCode.Success;
  res.status(Res.StatusCode.Success).json(response);
}

function sync(req, res, next) {
  var response = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : new Res["default"]();
  var validation = Validation.checkServerKey(req.params.serverId, req.headers.serverkey);

  if (validation === false) {
    next(Res.getValidationError(Res.ResponseCode.ValidationServerKey, response));
    return;
  }

  syncRankInfos();
  response.code = Res.ResponseCode.Success;
  res.status(Res.StatusCode.Success).json(response);
}

function addRank(req, res, next) {
  var response = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : new Res["default"]();
  var validation = Validation.checkServerKey(req.params.serverId, req.headers.serverkey);

  if (validation === false) {
    next(Res.getValidationError(Res.ResponseCode.ValidationServerKey, response));
    return;
  }

  var user = req.body;
  updater.updateBank(user, user.changeBank);
  response.code = Res.ResponseCode.Success;
  res.status(Res.StatusCode.Success).json(response);
}

function syncRankInfos() {
  debuger.log("syncRankInfos");
  OrientDB.db["class"].get(OrientDB.Class.RankInfo).then(function (RankInfo) {
    RankInfo.list().then(function (infos) {
      var remainRanks = [];
      infos.forEach(
      /*#__PURE__*/
      function () {
        var _ref = (0, _asyncToGenerator2["default"])(
        /*#__PURE__*/
        _regenerator["default"].mark(function _callee(info) {
          return _regenerator["default"].wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _context.next = 2;
                  return syncRanks(info, remainRanks);

                case 2:
                  remainRanks = _context.sent;

                case 3:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        }));

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }());
    });
  }, function (error) {
    return debuger.error(error, "syncRankInfos");
  });
}

function syncRanks(info, remainRanks) {
  debuger.log(remainRanks, "syncRank " + info.groupId);
  var className = OrientDB.Class.Rank + info.groupId;
  OrientDB.db["class"].get(className).then(function (Rank) {
    Rank.list().then(function (ranks) {
      ranks = ranks.concat(remainRanks);

      if (ranks.length >= LIMITED_RANKS_NUM) {
        var compare = function compare(a, b) {
          return a.bank < b.bank;
        };

        ranks.sort(compare);
        var remains = [];
        var minBank = 0;
        ranks.forEach(function (rank, idx) {
          if (idx <= LIMITED_RANKS_NUM) {
            minBank = rank.bank;
            var findIdx = remainRanks.indexOf(rank);
            if (findIdx != -1) move(rank, info.groupId);
          } else {
            remains.push(rank);
            remove(rank);
          }
        });
        info.status = RankGroupStatus.Full;
        info.bankMin = minBank;
        updateRankInfo(info);
        completed(remains);
      } else {
        if (remainRanks.length > 0) remainRanks.forEach(function (rank) {
          move(rank, info.groupId);
        });
        completed([]);
      }
    });
  }, function (error) {
    debuger.error(error, "syncRanks");
    completed([]);
  });

  function completed(arr) {
    return new Promise(function () {
      return arr;
    });
  }
}

function updateRankInfo(info) {
  OrientDB.db.record.get(info.rid).then(function (record) {
    Util.safeUpdate(record, "bank", info, "string");
    Util.safeUpdate(record, "status", info, "string");
    OrientDB.db.record.update(record).then(function (result) {
      return debuger.log(info, "rankInfo updated");
    }, function (error) {
      return debuger.error(error, "rankInfo updated");
    });
  }, function (error) {
    return debuger.error(error, "rank updated");
  });
}

function create(user, groupId) {
  var className = OrientDB.Class.Rank + groupId;
  OrientDB.db["class"].get(className).then(function (Rank) {
    Rank.create({
      userId: user["@rid"],
      profileImg: user.profileImg,
      name: user.name,
      bank: user.getBank
    }).then(function (rank) {
      return debuger.log(rank, "rank created");
    }, function (error) {
      return debuger.error(error, "rank created");
    });
  }, function (error) {
    return debuger.error(error, "rank created");
  });
}

function move(rank, groupId) {
  var className = OrientDB.Class.Rank + groupId;
  OrientDB.db["class"].get(className).then(function (Rank) {
    Rank.create({
      userId: rank.userId,
      profileImg: rank.profileImg,
      name: rank.name,
      bank: rank.bank
    }).then(function (rank) {
      return debuger.log(rank, "rank moved");
    }, function (error) {
      return debuger.error(error, "rank moved");
    });
  }, function (error) {
    return debuger.error(error, "rank created");
  });
}

function remove(rank) {
  OrientDB.db.record["delete"](rank.rid).then(function (record) {
    return debuger.log(rank, "rank deleted");
  }, function (error) {
    return debuger.error(error, "rank deleted");
  });
}

function update(rank, user) {
  OrientDB.db.record.get(rank.rid).then(function (record) {
    Util.safeUpdate(record, "profileImg", user, "string");
    Util.safeUpdate(record, "name", user, "string");
    record.bank = user.changeBank;
    OrientDB.db.record.update(record).then(function (result) {
      return debuger.log(user, "rank updated");
    }, function (error) {
      return debuger.error(error, "rank updated");
    });
  }, function (error) {
    return debuger.error(error, "rank updated");
  });
}