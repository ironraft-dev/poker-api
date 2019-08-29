import express from 'express';
import Debugger from '../skeleton/log';
import * as OrientDB from "../orient/db";
import Response, * as Res from  "./controller/response";
import * as Validation from  "./controller/validation";
import * as User from  "./controller/user";
const router = express.Router();
const debuger = new Debugger();
debuger.tag = "PUT"

router.use((req, res, next) => {
  if(req.method != debuger.tag) {
    next();
    return;
  }
  next();
});

router.put('/users/:userId', (req, res, next) => User.update(req, res, next));
export default router;
