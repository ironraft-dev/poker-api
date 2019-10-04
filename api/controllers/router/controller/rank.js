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
exports.updater = exports.RankUpdater = void 0;

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
debuger.tag = "Rank";
var RankGroupStatus = Object.freeze({
  Empty: 0,
  Full: 1
});
var UpdaterStatus = Object.freeze({
  Syncing: 0,
  Updating: 1,
  Writable: 2
});
var LIMITED_RANKS_NUM = 10;

var RankUpdater =
/*#__PURE__*/
function () {
  function RankUpdater() {
    (0, _classCallCheck2["default"])(this, RankUpdater);
    this.queue = [];
    this.status = UpdaterStatus.Writable;
    this.update();
  }

  (0, _createClass2["default"])(RankUpdater, [{
    key: "update",
    value: function update() {
      var _this = this;

      this.status = UpdaterStatus.Updating;
      this.rankInfos = [];
      OrientDB.db["class"].get(OrientDB.Class.RankInfo).then(function (RankInfo) {
        RankInfo.list().then(function (infos) {
          _this.rankInfos = infos;

          _this.updated();
        });
      }, function (error) {
        _this.status = UpdaterStatus.Writable;
        debuger.error("update rankInfos");
      });
    }
  }, {
    key: "updated",
    value: function updated() {
      var _this2 = this;

      this.status = UpdaterStatus.Writable;
      this.queue.forEach(function (user) {
        _this2.updateBank(user);
      });
    }
  }, {
    key: "syncStart",
    value: function syncStart() {
      this.status = UpdaterStatus.Syncing;
    }
  }, {
    key: "syncCompleted",
    value: function syncCompleted() {
      this.update();
    }
  }, {
    key: "updateBank",
    value: function updateBank(user) {
      if (this.status !== UpdaterStatus.Writable) {
        this.queue.push(user);
        return;
      }

      var prevInfo = this.rankInfos.find(function (rank) {
        return rank.groupId == user.rankId;
      });
      var info = this.rankInfos.find(function (rank) {
        if (rank.status == RankGroupStatus.Empty) return true;
        return user.getBank >= rank.bankMin;
      });
      debuger.log(prevInfo, "prevInfo");
      debuger.log(info, "info");
      if (info == null && prevInfo == null) return;
      if (prevInfo != null && info !== prevInfo) this.removeRank(user, prevInfo);
      this.addRank(user, info);
    }
  }, {
    key: "addRank",
    value: function addRank(user, info) {
      var className = OrientDB.Class.Rank + info.groupId;
      OrientDB.db.index.get(className + OrientDB.Index.RankId).then(function (Rank) {
        Rank.get(user.rid).then(function (rank) {
          if (rank == null) create(user, info.groupId);else update(rank, user);
        }, function (error) {
          return debuger.error(error, "addRank " + user.userId);
        });
      }, function (error) {
        return debuger.error(error, "addRank " + user.userId);
      });
    }
  }, {
    key: "removeRank",
    value: function removeRank(user, info) {
      var className = OrientDB.Class.Rank + info.groupId;
      OrientDB.db.index.get(className + OrientDB.Index.RankId).then(function (Rank) {
        Rank.get(user.rid).then(function (rank) {
          if (rank != null) remove(rank);
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
var updater = new RankUpdater();
exports.updater = updater;

function lists(req, res, next) {
  var response = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : new Res["default"]();
  var className = OrientDB.Class.Rank + req.query.groupId;
  OrientDB.db["class"].get(className).then(function (Rank) {
    Rank.list().then(function (ranks) {
      response.code = Res.ResponseCode.Success;

      var compare = function compare(a, b) {
        return b.bank - a.bank;
      };

      response.data = ranks.sort(compare);
      res.status(Res.StatusCode.Success).json(response);
    });
  }, function (error) {
    return next(Res.getDBError(error, response));
  });
}

function reset(req, res, next) {
  var response = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : new Res["default"]();
  var validation = Validation.checkServerKey(req.params.serverId, req.headers.serverkey);

  if (validation === false) {
    next(Res.getValidationError(Res.ResponseCode.ValidationServerKey, response));
    return;
  }

  updater.update();
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
  updater.updateBank(user);
  response.code = Res.ResponseCode.Success;
  res.status(Res.StatusCode.Success).json(response);
}

function syncRankInfos() {
  debuger.log("syncRankInfos");
  updater.syncStart();
  OrientDB.db["class"].get(OrientDB.Class.RankInfo).then(function (RankInfo) {
    RankInfo.list().then(
    /*#__PURE__*/
    function () {
      var _ref = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee(infos) {
        var remainRanks, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, info;

        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                remainRanks = [];
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context.prev = 4;
                _iterator = infos[Symbol.iterator]();

              case 6:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                  _context.next = 14;
                  break;
                }

                info = _step.value;
                _context.next = 10;
                return syncRanks(info, remainRanks);

              case 10:
                remainRanks = _context.sent;

              case 11:
                _iteratorNormalCompletion = true;
                _context.next = 6;
                break;

              case 14:
                _context.next = 20;
                break;

              case 16:
                _context.prev = 16;
                _context.t0 = _context["catch"](4);
                _didIteratorError = true;
                _iteratorError = _context.t0;

              case 20:
                _context.prev = 20;
                _context.prev = 21;

                if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                  _iterator["return"]();
                }

              case 23:
                _context.prev = 23;

                if (!_didIteratorError) {
                  _context.next = 26;
                  break;
                }

                throw _iteratorError;

              case 26:
                return _context.finish(23);

              case 27:
                return _context.finish(20);

              case 28:
                updater.syncCompleted();

              case 29:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[4, 16, 20, 28], [21,, 23, 27]]);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }());
  }, function (error) {
    updater.syncCompleted();
    debuger.error(error, "syncRankInfos");
  });
}

function syncRanks(info, remainRanks) {
  debuger.log(remainRanks, "syncRank " + info.groupId);
  return new Promise(function (resolve) {
    var className = OrientDB.Class.Rank + info.groupId;
    OrientDB.db["class"].get(className).then(function (Rank) {
      Rank.list().then(function (ranks) {
        ranks = ranks.concat(remainRanks);

        if (ranks.length >= LIMITED_RANKS_NUM) {
          var compare = function compare(a, b) {
            return b.bank - a.bank;
          };

          ranks.sort(compare);
          var remains = [];
          var minBank = 0;
          ranks.forEach(function (rank, idx) {
            if (idx < LIMITED_RANKS_NUM) {
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
          resolve(remains);
        } else {
          if (remainRanks.length > 0) remainRanks.forEach(function (rank) {
            move(rank, info.groupId);
          });
          resolve([]);
        }
      });
    }, function (error) {
      debuger.error(error, "syncRanks");
      resolve([]);
    });
  });
}

function updateRankInfo(info) {
  OrientDB.db.record.get(info["@rid"]).then(function (record) {
    Util.safeUpdate(record, "bankMin", info, "number");
    Util.safeUpdate(record, "status", info, "number");
    OrientDB.db.record.update(record).then(function (result) {
      return debuger.log(info, "updated");
    }, function (error) {
      return debuger.error(error, "updated");
    });
  }, function (error) {
    return debuger.error(error, "updated");
  });
}

function create(user, groupId) {
  var className = OrientDB.Class.Rank + groupId;
  OrientDB.db["class"].get(className).then(function (Rank) {
    Rank.create({
      userId: user.rid,
      profileImg: user.profileImg,
      name: user.name,
      bank: user.getBank,
      character: user.character
    }).then(function (rank) {
      debuger.log(rank, "created " + groupId);
      updateUserRank(rank.userId, groupId);
    }, function (error) {
      return debuger.error(error, "created " + groupId);
    });
  }, function (error) {
    return debuger.error(error, "created " + groupId);
  });
}

function move(rank, groupId) {
  var className = OrientDB.Class.Rank + groupId;
  OrientDB.db.index.get(className + OrientDB.Index.RankId).then(function (Rank) {
    var user = {
      rid: rank.userId,
      profileImg: rank.profileImg,
      name: rank.name,
      getBank: rank.bank,
      character: rank.character
    };
    Rank.get(rank.userId).then(function (updateRank) {
      if (updateRank == null) create(user, groupId);else update(updateRank, user);
    }, function (error) {
      return debuger.error(error, "moved " + groupId);
    });
  }, function (error) {
    return debuger.error(error, "moved " + groupId);
  });
}

function updateUserRank(userRid, groupId) {
  OrientDB.db.record.get(userRid).then(function (record) {
    record.rankId = groupId;
    OrientDB.db.record.update(record).then(function (result) {
      return debuger.log(record, "user rank updated");
    }, function (error) {
      return debuger.error(error, "user rank updated");
    });
  }, function (error) {
    return debuger.error(error, "user rank updated");
  });
}

function remove(rank) {
  OrientDB.db.record["delete"](rank["@rid"]).then(function (record) {
    return debuger.log(rank, "deleted");
  }, function (error) {
    return debuger.error(error, "deleted");
  });
}

function update(rank, user) {
  OrientDB.db.record.get(rank.rid).then(function (record) {
    Util.safeUpdate(record, "profileImg", user, "string");
    Util.safeUpdate(record, "name", user, "string");
    Util.safeUpdate(record, "character", user, "string");
    record.bank = user.getBank;
    OrientDB.db.record.update(record).then(function (result) {
      return debuger.log(user, "rank updated");
    }, function (error) {
      return debuger.error(error, "rank updated");
    });
  }, function (error) {
    return debuger.error(error, "rank updated");
  });
}