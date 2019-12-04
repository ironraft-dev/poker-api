import Debugger from '../../skeleton/log';
import * as OrientDB from "../../orient/db";
import Response, * as Res from  "./response";
import * as Validation from  "./validation";
import * as Util from  "./util";
import * as Config from  "../../config";
import * as Rank from  "./rank";
const debuger = new Debugger();
debuger.tag = "User"

export function lists(req, res, next, response = new Response()){
  OrientDB.db.class.get(OrientDB.Class.User).then(
    (User) => {
       User.list().then(
         (users)=>{
           response.code = Res.ResponseCode.Success;
           response.data = users.map ( user => {
             user.loginToken = "";
             return user;
           });
           res.status(Res.StatusCode.Success).json(response);
         }
       )
    },
    (error) => {
       next(Res.getDBError(error, response));
    }
  );
}
export function list(req, res, next, id = req.params.userId, response = new Response()){
  OrientDB.db.index.get( OrientDB.Index.User).then(
    (User) => {
       User.get(req.params.userId).then(
         (user)=>{
            if(user === undefined) next(Res.getUnregisteredError(response));
            else record(req, res, next, user.rid , response );
         },
         (error) => {
            next(Res.getBadRequestError(error,Res.ResponseCode.UndefinedKey, response));
         }
       )
    },
    (error) => {
       next(Res.getDBError(error, response));
    }
  );
}

export function record(req, res, next, rid = req.query.rid , response = new Response(), newLoginToken = null){
  OrientDB.db.record.get( rid ).then(
    (record) => {
      let validation = Validation.checkId(req.params.userId, record.id);
      if(validation === true){
        if(newLoginToken == null){
          response.code = Res.ResponseCode.Success;
          response.data = record;
          //response.data.loginToken = "";
          res.status(Res.StatusCode.Success).json(response);
        }else{
          Util.safeUpdate(record, "loginToken", newLoginToken , "string");
          OrientDB.db.record.update(record).then(
            (result) => {
              response.code = Res.ResponseCode.Success;
              response.data = record;
              res.status(Res.StatusCode.Success).json(response);
            },
            (error) => {
               next(Res.getDBError(error, response));
            }
          )
        }
      }else{
        next(Res.getValidationError(Res.ResponseCode.ValidationUserId, response));
      }
    },
    (error) => {
       next(Res.getBadRequestError(error,Res.ResponseCode.UndefinedKey, response));
    }
  )
}


export function create(req, res, next, response = new Response()){
  OrientDB.db.class.get(OrientDB.Class.User).then(
    (User) => {
       let profileImg = (req.body.profileImg !== undefined) ? req.body.profileImg :  Config.DEFAULT_PROFILE_IMAGE;
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
      }).then(
         (user)=>{
           response.code = Res.ResponseCode.Success;
           response.data = user;
           res.status(Res.StatusCode.Create).json(response);
         },
         (error) => {
           next(Res.getBadRequestError(error,Res.ResponseCode.DuplicatedKey, response));
         }
       )
    },
    (error) => {
       next(Res.getDBError(error, response));
    }
  );
}

export function remove(req, res, next, response = new Response()){
  OrientDB.db.record.delete( req.body.rid ).then(
    (record) => {
      response.code = Res.ResponseCode.Success;
      res.status(Res.StatusCode.Success).json(response);
    },
    (error) => {
       next(Res.getBadRequestError(error,Res.ResponseCode.UndefinedKey, response));
    }
  );
}

export function update(req, res, next, response = new Response()){
  OrientDB.db.record.get( req.body.rid ).then(
    (record) => {
       var validation = Validation.checkId(req.params.userId, record.id);
       if(validation === false){
         next(Res.getValidationError(Res.ResponseCode.ValidationUserId, response));
         return;
       }
       validation = Validation.checkLoginToken(req.headers.logintoken, record.loginToken);
       if(validation === false){
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
       } catch (error){
         next(Res.getBadRequestError(error,Res.ResponseCode.InvalidDataType, response));
         return;
       }
       OrientDB.db.record.update(record).then(
         (result) => {
           response.code = Res.ResponseCode.Success;
           response.data = record;
           res.status(Res.StatusCode.Success).json(response);
         },
         (error) => {
            next(Res.getDBError(error, response));
         }
       )
    },
    (error) => {
       next(Res.getBadRequestError(error,Res.ResponseCode.UndefinedKey, response));
    }
  );
}

export function updateBank(req, res, next, response = new Response()){
  OrientDB.db.record.get( req.body.rid ).then(
    (record) => {
       var validation = Validation.checkId(req.params.userId, record.id);
       if(validation === false){
         next(Res.getValidationError(Res.ResponseCode.ValidationUserId, response));
         return;
       }
       validation = Validation.checkLoginToken(req.headers.logintoken, record.loginToken);
       if(validation === false){
         next(Res.getValidationError(Res.ResponseCode.ValidationLoginToken, response));
         return;
       }
       if(record.bank > 0){
         response.code = Res.ResponseCode.InvalidDataType;
         response.message = "bank update is only possible when zero";
         next({statusCode: Res.StatusCode.NotAcceptable, response:response});
         return;
       }
       try {
         Util.safeUpdate(record, "bank", req.body, "number");
       } catch (error){
         next(Res.getBadRequestError(error,Res.ResponseCode.InvalidDataType, response));
         return;
       }
       OrientDB.db.record.update(record).then(
         (result) => {
           response.code = Res.ResponseCode.Success;
           response.data = record;
           res.status(Res.StatusCode.Success).json(response);
         },
         (error) => {
            next(Res.getDBError(error, response));
         }
       )
    },
    (error) => {
       next(Res.getBadRequestError(error,Res.ResponseCode.UndefinedKey, response));
    }
  );
}

export function updateValues(req, res, next, response = new Response()){
  let validation = Validation.checkServerKey(req.params.serverId, req.headers.serverkey);
  if(validation === false){
    next(Res.getValidationError(Res.ResponseCode.ValidationServerKey, response));
    return;
  }
  let users = req.body;
  var errors = [];
  let total = users.length;
  var completed = 0;
  users.forEach( (user) => {
    OrientDB.db.record.get( user.rid ).then(
      (record) => {
         try {
           Util.safeUpdate(record, req.query.key , user.value, req.query.dataType);
           OrientDB.db.record.update(record).then(
             (result) => {
                updateCompleted();
             },
             (error) => {
                errors.push(user);
                debuger.error(user, "user updates record error");
                updateCompleted();
             }
           )
         } catch (error) {
           errors.push(user);
           debuger.error(user,"user updates type error");
           updateCompleted();
         }
      },
      (error) => {
         errors.push(user);
         debuger.error(user, "user updates db error");
         updateCompleted();
      }
    )
  });
  function updateCompleted(){
    completed ++;
    if(completed !== total) return;
    updateAllCompleted(errors, res, response);
  }
}

export function changeBanks(req, res, next, response = new Response()){
  let validation = Validation.checkServerKey(req.params.serverId, req.headers.serverkey);
  if(validation === false){
    next(Res.getValidationError(Res.ResponseCode.ValidationServerKey, response));
    return;
  }
  let users = req.body;
  var errors = [];
  let total = users.length;
  var completed = 0;
  users.forEach( (user) => {
    OrientDB.db.record.get( user.rid ).then(
      (record) => {
         Util.safeUpdate(record, "getBank" , (record.getBank+user.changeBank) , "number");
         Util.safeUpdate(record, "bank" , (record.bank+user.changeBank) , "number");
         let ranker = {
           rid:user.rid,
           getBank:record.getBank,
           changeBank:user.changeBank,
           profileImg:record.profileImg,
           name:record.name,
           character:record.character

         }
         Rank.updater.updateBank(ranker);
         OrientDB.db.record.update(record).then(
           (result) => {
              changeBankCompleted();
           },
           (error) => {
              errors.push(user);
              debuger.error(user, "user change bank error");
              changeBankCompleted();
           }
         )
      },
      (error) => {
         errors.push(user);
         debuger.error(user, "user change bank db error");
         changeBankCompleted();
      }
    )
  });
  function changeBankCompleted(){
    completed ++;
    if(completed !== total) return;
    updateAllCompleted(errors, res, response);
  }
}

function updateAllCompleted(errors, res, response){
  if(errors.length>0){
    response.code = Res.ResponseCode.DBError;
    response.message = "conflicted updated";
    response.data = errors;
    next({statusCode: Res.StatusCode.Conflict, response:response});
  }else{
    response.code = Res.ResponseCode.Success;
    res.status(Res.StatusCode.Success).json(response);
  }
}
