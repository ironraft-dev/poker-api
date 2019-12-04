import express from 'express';
import Debugger from '../skeleton/log';
import * as OrientDB from "../orient/db";
import Response, * as Res from  "./controller/response";
import * as Validation from  "./controller/validation";
import * as User from  "./controller/user";
import * as Rank from  "./controller/rank";
import * as Content from  "./controller/content";
const router = express.Router();
const debuger = new Debugger();
debuger.tag = "GET"

router.use((req, res, next) => {
  if(req.method != debuger.tag) {
    next();
    return;
  }
  next();
});

router.get('/contents/', (req, res, next) => Content.lists(req, res, next));
router.get('/ranks/', (req, res, next) => Rank.lists(req, res, next));
router.get('/ranks/reset/:serverId', (req, res, next) => Rank.reset(req, res, next));
router.get('/ranks/sync/:serverId', (req, res, next) => Rank.sync(req, res, next));
router.get('/users/', (req, res, next) => User.lists(req, res, next));
router.get('/users/:userId', (req, res, next) => {
  if(req.query.rid != undefined) User.record(req, res, next)
  else User.list(req, res, next)
});



export default router;
