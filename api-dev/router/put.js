import express from 'express';
import Debugger from '../skeleton/log';
import * as OrientDB from "../orient/db";
import Response, * as Res from  "./controller/response";
import * as Validation from  "./controller/validation";
import * as User from  "./controller/user";
import * as Rank from  "./controller/rank";
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
router.put('/ranks/add/:serverId', (req, res, next) => Rank.addRank(req, res, next));
router.put('/users/:userId', (req, res, next) => User.update(req, res, next));
router.put('/users/updatebank/:userId', (req, res, next) => User.updateBank(req, res, next));
router.put('/users/update/:serverId', (req, res, next) => User.updateValues(req, res, next));
router.put('/users/changebank/:serverId', (req, res, next) => User.changeBanks(req, res, next));
export default router;
