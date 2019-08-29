import express from 'express';
import Debugger from '../skeleton/log';
import * as OrientDB from "../orient/db";
import Response, * as Res from  "./controller/response";
import * as Validation from  "./controller/validation";
import * as User from  "./controller/user";

const router = express.Router();
const debuger = new Debugger();
debuger.tag = "POST"

router.use((req, res, next) => {
    if(req.method != debuger.tag) {
      next();
      return;
    }
    Validation.checkAccessToken(req.body.snsToken, (validation)=>{
      if(validation === true) next();
      else next(Res.getAccessTokenError());
    })
});



router.post('/users/:userId', (req, res, next) => User.create(req, res, next));
router.post('/users/autosign/:userId', (req, res, next) => {
  let response = new Response();
  OrientDB.db.index.get( OrientDB.Index.User).then(
    (UserIdx) => {
       UserIdx.get(req.params.userId).then(
         (user)=>{
           if(user === undefined) User.create(req, res, next, response);
           else User.record(req, res, next, user.rid, response, Validation.getLoginToken());
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
});




export default router;
