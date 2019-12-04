"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lists = lists;
exports.list = list;
exports.record = record;
exports.create = create;
exports.remove = remove;
exports.update = update;
exports.updateBank = updateBank;
exports.updateValues = updateValues;
exports.changeBanks = changeBanks;

var _log = _interopRequireDefault(require("../../skeleton/log"));

var OrientDB = _interopRequireWildcard(require("../../orient/db"));

var Res = _interopRequireWildcard(require("./response"));

var Validation = _interopRequireWildcard(require("./validation"));

var Util = _interopRequireWildcard(require("./util"));

var Config = _interopRequireWildcard(require("../../config"));

var Rank = _interopRequireWildcard(require("./rank"));

var debuger = new _log["default"]();
debuger.tag = "User";

function lists(req, res, next) {
  var response = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : new Res["default"]();
  OrientDB.db["class"].get(OrientDB.Class.User).then(function (User) {
    User.list().then(function (users) {
      response.code = Res.ResponseCode.Success;
      response.data = users.map(function (user) {
        user.loginToken = "";
        return user;
      });
      res.status(Res.StatusCode.Success).json(response);
    });
  }, function (error) {
    next(Res.getDBError(error, response));
  });
}

function list(req, res, next) {
  var id = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : req.params.userId;
  var response = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : new Res["default"]();
  OrientDB.db.index.get(OrientDB.Index.User).then(function (User) {
    User.get(req.params.userId).then(function (user) {
      if (user === undefined) next(Res.getUnregisteredError(response));else record(req, res, next, user.rid, response);
    }, function (error) {
      next(Res.getBadRequestError(error, Res.ResponseCode.UndefinedKey, response));
    });
  }, function (error) {
    next(Res.getDBError(error, response));
  });
}

function record(req, res, next) {
  var rid = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : req.query.rid;
  var response = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : new Res["default"]();
  var newLoginToken = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
  OrientDB.db.record.get(rid).then(function (record) {
    var validation = Validation.checkId(req.params.userId, record.id);

    if (validation === true) {
      if (newLoginToken == null) {
        response.code = Res.ResponseCode.Success;
        response.data = record; //response.data.loginToken = "";

        res.status(Res.StatusCode.Success).json(response);
      } else {
        Util.safeUpdate(record, "loginToken", newLoginToken, "string");
        OrientDB.db.record.update(record).then(function (result) {
          response.code = Res.ResponseCode.Success;
          response.data = record;
          res.status(Res.StatusCode.Success).json(response);
        }, function (error) {
          next(Res.getDBError(error, response));
        });
      }
    } else {
      next(Res.getValidationError(Res.ResponseCode.ValidationUserId, response));
    }
  }, function (error) {
    next(Res.getBadRequestError(error, Res.ResponseCode.UndefinedKey, response));
  });
}

function create(req, res, next) {
  var response = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : new Res["default"]();
  OrientDB.db["class"].get(OrientDB.Class.User).then(function (User) {
    var profileImg = req.body.profileImg !== undefined ? req.body.profileImg : Config.DEFAULT_PROFILE_IMAGE;
    User.create({
      id: req.params.userId,
      profileImg: profileImg,
      name: req.body.name,
      snsToken: req.body.snsToken,
      bank: Config.DEFAULT_BANK,
      getBank: 0,
      loginToken: Validation.getLoginToken(),
      character: req.body.character,
      rank: -1
    }).then(function (user) {
      response.code = Res.ResponseCode.Success;
      response.data = user;
      res.status(Res.StatusCode.Create).json(response);
    }, function (error) {
      next(Res.getBadRequestError(error, Res.ResponseCode.DuplicatedKey, response));
    });
  }, function (error) {
    next(Res.getDBError(error, response));
  });
}

function remove(req, res, next) {
  var response = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : new Res["default"]();
  OrientDB.db.record["delete"](req.body.rid).then(function (record) {
    response.code = Res.ResponseCode.Success;
    res.status(Res.StatusCode.Success).json(response);
  }, function (error) {
    next(Res.getBadRequestError(error, Res.ResponseCode.UndefinedKey, response));
  });
}

function update(req, res, next) {
  var response = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : new Res["default"]();
  OrientDB.db.record.get(req.body.rid).then(function (record) {
    var validation = Validation.checkId(req.params.userId, record.id);

    if (validation === false) {
      next(Res.getValidationError(Res.ResponseCode.ValidationUserId, response));
      return;
    }

    validation = Validation.checkLoginToken(req.headers.logintoken, record.loginToken);

    if (validation === false) {
      next(Res.getValidationError(Res.ResponseCode.ValidationLoginToken, response));
      return;
    }

    try {
      Util.safeUpdate(record, "profileImg", req.body, "string");
      Util.safeUpdate(record, "name", req.body, "string");
      Util.safeUpdate(record, "snsToken", req.body, "string");
      Util.safeUpdate(record, "bank", req.body, "number");
      Util.safeUpdate(record, "rank", req.body, "number");
      Util.safeUpdate(record, "character", req.body, "string");
    } catch (error) {
      next(Res.getBadRequestError(error, Res.ResponseCode.InvalidDataType, response));
      return;
    }

    OrientDB.db.record.update(record).then(function (result) {
      response.code = Res.ResponseCode.Success;
      response.data = record;
      res.status(Res.StatusCode.Success).json(response);
    }, function (error) {
      next(Res.getDBError(error, response));
    });
  }, function (error) {
    next(Res.getBadRequestError(error, Res.ResponseCode.UndefinedKey, response));
  });
}

function updateBank(req, res, next) {
  var response = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : new Res["default"]();
  OrientDB.db.record.get(req.body.rid).then(function (record) {
    var validation = Validation.checkId(req.params.userId, record.id);

    if (validation === false) {
      next(Res.getValidationError(Res.ResponseCode.ValidationUserId, response));
      return;
    }

    validation = Validation.checkLoginToken(req.headers.logintoken, record.loginToken);

    if (validation === false) {
      next(Res.getValidationError(Res.ResponseCode.ValidationLoginToken, response));
      return;
    }

    if (record.bank > 0) {
      response.code = Res.ResponseCode.InvalidDataType;
      response.message = "bank update is only possible when zero";
      next({
        statusCode: Res.StatusCode.NotAcceptable,
        response: response
      });
      return;
    }

    try {
      Util.safeUpdate(record, "bank", req.body, "number");
    } catch (error) {
      next(Res.getBadRequestError(error, Res.ResponseCode.InvalidDataType, response));
      return;
    }

    OrientDB.db.record.update(record).then(function (result) {
      response.code = Res.ResponseCode.Success;
      response.data = record;
      res.status(Res.StatusCode.Success).json(response);
    }, function (error) {
      next(Res.getDBError(error, response));
    });
  }, function (error) {
    next(Res.getBadRequestError(error, Res.ResponseCode.UndefinedKey, response));
  });
}

function updateValues(req, res, next) {
  var response = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : new Res["default"]();
  var validation = Validation.checkServerKey(req.params.serverId, req.headers.serverkey);

  if (validation === false) {
    next(Res.getValidationError(Res.ResponseCode.ValidationServerKey, response));
    return;
  }

  var users = req.body;
  var errors = [];
  var total = users.length;
  var completed = 0;
  users.forEach(function (user) {
    OrientDB.db.record.get(user.rid).then(function (record) {
      try {
        Util.safeUpdate(record, req.query.key, user.value, req.query.dataType);
        OrientDB.db.record.update(record).then(function (result) {
          updateCompleted();
        }, function (error) {
          errors.push(user);
          debuger.error(user, "user updates record error");
          updateCompleted();
        });
      } catch (error) {
        errors.push(user);
        debuger.error(user, "user updates type error");
        updateCompleted();
      }
    }, function (error) {
      errors.push(user);
      debuger.error(user, "user updates db error");
      updateCompleted();
    });
  });

  function updateCompleted() {
    completed++;
    if (completed !== total) return;
    updateAllCompleted(errors, res, response);
  }
}

function changeBanks(req, res, next) {
  var response = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : new Res["default"]();
  var validation = Validation.checkServerKey(req.params.serverId, req.headers.serverkey);

  if (validation === false) {
    next(Res.getValidationError(Res.ResponseCode.ValidationServerKey, response));
    return;
  }

  var users = req.body;
  var errors = [];
  var total = users.length;
  var completed = 0;
  users.forEach(function (user) {
    OrientDB.db.record.get(user.rid).then(function (record) {
      Util.safeUpdate(record, "getBank", record.getBank + user.changeBank, "number");
      Util.safeUpdate(record, "bank", record.bank + user.changeBank, "number");
      var ranker = {
        rid: user.rid,
        getBank: record.getBank,
        changeBank: user.changeBank,
        profileImg: record.profileImg,
        name: record.name,
        character: record.character
      };
      Rank.updater.updateBank(ranker);
      OrientDB.db.record.update(record).then(function (result) {
        changeBankCompleted();
      }, function (error) {
        errors.push(user);
        debuger.error(user, "user change bank error");
        changeBankCompleted();
      });
    }, function (error) {
      errors.push(user);
      debuger.error(user, "user change bank db error");
      changeBankCompleted();
    });
  });

  function changeBankCompleted() {
    completed++;
    if (completed !== total) return;
    updateAllCompleted(errors, res, response);
  }
}

function updateAllCompleted(errors, res, response) {
  if (errors.length > 0) {
    response.code = Res.ResponseCode.DBError;
    response.message = "conflicted updated";
    response.data = errors;
    next({
      statusCode: Res.StatusCode.Conflict,
      response: response
    });
  } else {
    response.code = Res.ResponseCode.Success;
    res.status(Res.StatusCode.Success).json(response);
  }
}