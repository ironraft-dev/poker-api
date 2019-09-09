import Debugger from '../../skeleton/log';
import * as OrientDB from "../../orient/db";
import Response, * as Res from  "./response";
import * as Validation from  "./validation";
import * as Util from  "./util";
import * as Config from  "../../config";
const debuger = new Debugger();
debuger.tag = "User"

const RankGroupStatus = Object.freeze ({
	Empty: 0,
  Full: 1
});

const LIMITED_RANKS_NUM = 10;

export class RankUpdater {
  constructor() {
    this.rankInfos = [];
    OrientDB.db.class.get(OrientDB.Class.RankInfo).then(
      (RankInfo) => {
         RankInfo.list().then(
           (infos) => {
             this.rankInfos = infos;
             debuger.log("get rankInfos");
           }
         )
      },
      (error) => debuger.error("get rankInfos")
    );
  }

  updateBank(user, changeBank){
     let prevBank = user.getBank - changeBank;
     let compare = (i) => {
       if( i.status == RankGroupStatus.Empty ) return true
       return prevBank >= i.bankMin
     }
     let prevInfo = this.rankInfos.find( compare );
     let info = this.rankInfos.find( compare );
     if(info == null && prevBank == null) return;
     if(info !== prevBank ) this.removeRank(user, prevBank);
     this.addRank(user, prevBank);
  }

  addRank(user, info){
    let className = OrientDB.Class.Rank + info.groupId;
    OrientDB.db.index.get( className + OrientDB.Index.RankId ).then(
      (Rank) => {
         Rank.get(req.params.userId).then(
           (rank) => update(rank, user),
           (error) => debuger.error(error, "addRank " + user.userId)
         )
      },
      (error) => {
         create(user,info.groupId);
      }
    );
  }

  removeRank(user, info){
    let className = OrientDB.Class.Rank + info.groupId;
    OrientDB.db.index.get( className + OrientDB.Index.RankId ).then(
      (Rank) => {
         Rank.get(req.params.userId).then(
           (rank) => remove(rank),
           (error) => debuger.error(error, "removeRank " + user.userId)
         )
      },
      (error) => debuger.error(error, "removeRank " + user.userId)
    );
  }
}


export function lists(req, res, next, response = new Response()){
  let className = OrientDB.Class.Rank + req.query.groupId;
  OrientDB.db.class.get(className).then(
    (Rank) => {
       Rank.list().then(
         (ranks)=>{
           response.code = Res.ResponseCode.Success;
           let compare = (a, b) => {return a.bank < b.bank};
           ranks.sort( compare );
           response.data = ranks;
           res.status(Res.StatusCode.Success).json(response);
         }
       )
    },
    (error) => next(Res.getDBError(error, response))
  );
}

var updater = new RankUpdater();
export function reset(req, res, next, response = new Response()){
  let validation = Validation.checkServerKey(req.params.serverId, req.headers.serverkey);
  if(validation === false){
    next(Res.getValidationError(Res.ResponseCode.ValidationServerKey, response));
    return;
  }
  updater = new RankUpdater();
  response.code = Res.ResponseCode.Success;
  res.status(Res.StatusCode.Success).json(response);
}

export function sync(req, res, next, response = new Response()){
  let validation = Validation.checkServerKey(req.params.serverId, req.headers.serverkey);
  if(validation === false){
    next(Res.getValidationError(Res.ResponseCode.ValidationServerKey, response));
    return;
  }
  syncRankInfos();
  response.code = Res.ResponseCode.Success;
  res.status(Res.StatusCode.Success).json(response);
}

export function addRank(req, res, next, response = new Response()){
  let validation = Validation.checkServerKey(req.params.serverId, req.headers.serverkey);
  if(validation === false){
    next(Res.getValidationError(Res.ResponseCode.ValidationServerKey, response));
    return;
  }

  let user = req.body;
  updater.updateBank(user, user.changeBank);
  response.code = Res.ResponseCode.Success;
  res.status(Res.StatusCode.Success).json(response);
}

function syncRankInfos(){
  debuger.log("syncRankInfos");
  OrientDB.db.class.get(OrientDB.Class.RankInfo).then(
    (RankInfo) => {
       RankInfo.list().then(
         (infos)=>{
           var remainRanks = [];
           infos.forEach(
             async (info) => {
               remainRanks = await syncRanks(info, remainRanks);
             }
           );
         }
       )
    },
    (error) => debuger.error(error,"syncRankInfos")
  );
}

function syncRanks(info, remainRanks){
  debuger.log(remainRanks, "syncRank " + info.groupId);
  let className = OrientDB.Class.Rank + info.groupId;
  OrientDB.db.class.get(className).then(
    (Rank) => {
       Rank.list().then(
         (ranks)=>{
            ranks = ranks.concat(remainRanks);
            if(ranks.length >= LIMITED_RANKS_NUM){
               let compare = (a, b) => {return a.bank < b.bank};
               ranks.sort( compare );
               let remains = [];
               var minBank = 0;
               ranks.forEach( (rank, idx) => {
                 if(idx<=LIMITED_RANKS_NUM){
                    minBank = rank.bank;
                    let findIdx = remainRanks.indexOf(rank);
                    if(findIdx != -1) move(rank, info.groupId);
                 }else{
                    remains.push(rank);
                    remove(rank);
                 }
               });
               info.status = RankGroupStatus.Full;
               info.bankMin = minBank;
               updateRankInfo(info);
               completed(remains);
            } else {
               if(remainRanks.length > 0) remainRanks.forEach( (rank) => { move(rank, info.groupId) } );
               completed([]);
            }
         }
       )
    },
    (error) => {
      debuger.error(error,"syncRanks")
      completed([]);
    }
  );

  function completed(arr){
    return new Promise(()=> {return arr});
  }

}

function updateRankInfo(info){
  OrientDB.db.record.get( info.rid ).then(
    (record) => {
       Util.safeUpdate(record, "bank", info, "string");
       Util.safeUpdate(record, "status", info, "string");
       OrientDB.db.record.update(record).then(
         (result) => debuger.log(info, "rankInfo updated"),
         (error) => debuger.error(error, "rankInfo updated")
       )
    },
    (error) => debuger.error(error, "rank updated")
  );
}

function create(user,groupId){
  let className = OrientDB.Class.Rank + groupId;
  OrientDB.db.class.get(className).then(
    (Rank) => {
       Rank.create({
         userId:user["@rid"],
         profileImg: user.profileImg,
         name: user.name,
         bank: user.getBank
      }).then(
         (rank) => debuger.log(rank, "rank created"),
         (error) => debuger.error(error, "rank created")
       )
    },
    (error) => debuger.error(error, "rank created")
  );
}

function move(rank,groupId){
  let className = OrientDB.Class.Rank + groupId;
  OrientDB.db.class.get(className).then(
    (Rank) => {
       Rank.create({
         userId:rank.userId,
         profileImg: rank.profileImg,
         name: rank.name,
         bank: rank.bank
      }).then(
         (rank) => debuger.log(rank, "rank moved"),
         (error) => debuger.error(error, "rank moved")
       )
    },
    (error) => debuger.error(error, "rank created")
  );
}

function remove(rank){
  OrientDB.db.record.delete( rank.rid ).then(
    (record) => debuger.log(rank, "rank deleted"),
    (error) => debuger.error(error, "rank deleted")
  );
}

function update(rank, user){
  OrientDB.db.record.get( rank.rid ).then(
    (record) => {
       Util.safeUpdate(record, "profileImg", user, "string");
       Util.safeUpdate(record, "name", user, "string");
       record.bank = user.changeBank;
       OrientDB.db.record.update(record).then(
         (result) => debuger.log(user, "rank updated"),
         (error) => debuger.error(error, "rank updated")
       )
    },
    (error) => debuger.error(error, "rank updated")
  );
}
