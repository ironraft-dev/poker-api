import Debugger from '../../skeleton/log';
import * as OrientDB from "../../orient/db";
import Response, * as Res from  "./response";
import * as Validation from  "./validation";
import * as Util from  "./util";
import * as Config from  "../../config";
const debuger = new Debugger();
debuger.tag = "Rank"

const RankGroupStatus = Object.freeze ({
	Empty: 0,
  Full: 1
});

const UpdaterStatus = Object.freeze ({
	Syncing: 0,
	Updating: 1,
  Writable: 2
});

const LIMITED_RANKS_NUM = 10;

export class RankUpdater {
  constructor() {
	  this.queue = [];
		this.status = UpdaterStatus.Writable;
    this.update();
  }

	update(){
		this.status = UpdaterStatus.Updating;
		this.rankInfos = [];
    OrientDB.db.class.get(OrientDB.Class.RankInfo).then(
      (RankInfo) => {
         RankInfo.list().then(
           (infos) => {
             this.rankInfos = infos;
						 this.updated();
           }
         )
      },
      (error) => {
				this.status = UpdaterStatus.Writable;
				debuger.error("update rankInfos");
			}
    );
	}
	updated(){
		this.status = UpdaterStatus.Writable;
		this.queue.forEach( (user) => { this.updateBank( user )});
	}
  syncStart(){
		this.status = UpdaterStatus.Syncing;
	}
	syncCompleted(){
		this.update();
	}

  updateBank(user){
     if(this.status !== UpdaterStatus.Writable){
			 this.queue.push(user);
			 return;
		 }

     let prevInfo = this.rankInfos.find( rank => rank.groupId == user.rankId );
     let info = this.rankInfos.find( rank => {
       if( rank.status == RankGroupStatus.Empty ) return true
       return user.getBank >= rank.bankMin
     } );
     debuger.log(prevInfo, "prevInfo");
		 debuger.log(info, "info");
     if(info == null && prevInfo == null) return;
     if(prevInfo != null && info !== prevInfo ) this.removeRank(user, prevInfo);
     this.addRank(user, info);
  }

  addRank(user, info){
    let className = OrientDB.Class.Rank + info.groupId;
    OrientDB.db.index.get( className + OrientDB.Index.RankId ).then(
      (Rank) => {
         Rank.get(user.rid).then(
           (rank) => {
						 if(rank == null) create(user,info.groupId)
						 else update(rank, user)
					 },
           (error) => debuger.error(error, "addRank " + user.userId)
         )
      },
      (error) => debuger.error(error, "addRank " + user.userId)
    );
  }

  removeRank(user, info){
    let className = OrientDB.Class.Rank + info.groupId;
    OrientDB.db.index.get( className + OrientDB.Index.RankId ).then(
      (Rank) => {
         Rank.get(user.rid).then(
           (rank) => {
						 if(rank != null) remove(rank);
					 },
           (error) => debuger.error(error, "removeRank " + user.userId)
         )
      },
      (error) => debuger.error(error, "removeRank " + user.userId)
    );
  }
}
export const updater = new RankUpdater();


export function lists(req, res, next, response = new Response()){
  let className = OrientDB.Class.Rank + req.query.groupId;
  OrientDB.db.class.get(className).then(
    (Rank) => {
       Rank.list().then(
         (ranks)=>{
           response.code = Res.ResponseCode.Success;
           let compare = (a, b) => {return b.bank - a.bank};
           response.data = ranks.sort( compare );
           res.status(Res.StatusCode.Success).json(response);
         }
       )
    },
    (error) => next(Res.getDBError(error, response))
  );
}


export function reset(req, res, next, response = new Response()){
  let validation = Validation.checkServerKey(req.params.serverId, req.headers.serverkey);
  if(validation === false){
    next(Res.getValidationError(Res.ResponseCode.ValidationServerKey, response));
    return;
  }
  updater.update();
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
  updater.updateBank(user);
  response.code = Res.ResponseCode.Success;
  res.status(Res.StatusCode.Success).json(response);
}

function syncRankInfos(){
  debuger.log("syncRankInfos");
	updater.syncStart();
  OrientDB.db.class.get(OrientDB.Class.RankInfo).then(
    (RankInfo) => {
       RankInfo.list().then(
         	async (infos)=>{
           var remainRanks = [];
					 for (const info of infos){
			 				remainRanks = await syncRanks(info, remainRanks)
			 			}
						updater.syncCompleted();
         }
       )
    },
    (error) => {
			updater.syncCompleted();
			debuger.error(error,"syncRankInfos");
		}
  );
}

function syncRanks(info, remainRanks){
	debuger.log(remainRanks, "syncRank " + info.groupId);
	return new Promise((resolve)=>{
		let className = OrientDB.Class.Rank + info.groupId;
	  OrientDB.db.class.get(className).then(
	    (Rank) => {
	       Rank.list().then(
	         (ranks)=>{
	            ranks = ranks.concat(remainRanks);
	            if(ranks.length >= LIMITED_RANKS_NUM){
	               let compare = (a, b) => {return b.bank - a.bank};
	               ranks.sort( compare );
	               let remains = [];
	               var minBank = 0;
	               ranks.forEach( (rank, idx) => {
	                 if(idx<LIMITED_RANKS_NUM){
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
	               resolve(remains);
	            } else {
	               if(remainRanks.length > 0) remainRanks.forEach( (rank) => { move(rank, info.groupId) } );
	               resolve([]);
	            }
	         }
	       )
	    },
	    (error) => {
	      debuger.error(error,"syncRanks")
	      resolve([]);
	    }
	  );
	});
}

function updateRankInfo(info){
  OrientDB.db.record.get( info["@rid"] ).then(
    (record) => {
       Util.safeUpdate(record, "bankMin", info, "number");
       Util.safeUpdate(record, "status", info, "number");
       OrientDB.db.record.update(record).then(
         (result) => debuger.log(info, "updated"),
         (error) => debuger.error(error, "updated")
       )
    },
    (error) => debuger.error(error, "updated")
  );
}

function create(user,groupId){
  let className = OrientDB.Class.Rank + groupId;
  OrientDB.db.class.get(className).then(
    (Rank) => {
       Rank.create({
         userId:user.rid,
         profileImg: user.profileImg,
         name: user.name,
         bank: user.getBank,
				 character:  user.character
      }).then(
         (rank) => {
					 debuger.log(rank, "created " + groupId);
					 updateUserRank(rank.userId, groupId);
				 },
         (error) => debuger.error(error, "created " + groupId)
       )
    },
    (error) => debuger.error(error, "created " + groupId)
  );
}

function move(rank,groupId){
  let className = OrientDB.Class.Rank + groupId;
	OrientDB.db.index.get( className + OrientDB.Index.RankId ).then(
    (Rank) => {
			  let user = {
					rid:rank.userId,
          profileImg: rank.profileImg,
          name: rank.name,
          getBank: rank.bank,
					character: rank.character
				}
				Rank.get(rank.userId).then(
					(updateRank) => {
						if(updateRank == null) create(user,groupId)
						else update(updateRank, user)
					},
					(error) => debuger.error(error, "moved " + groupId)
				)
    },
    (error) => debuger.error(error, "moved " + groupId)
  );
}

function updateUserRank(userRid,groupId){
  OrientDB.db.record.get( userRid ).then(
    (record) => {
       record.rankId = groupId;
       OrientDB.db.record.update(record).then(
         (result) => debuger.log(record, "user rank updated"),
         (error) => debuger.error(error, "user rank updated")
       )
    },
    (error) => debuger.error(error, "user rank updated")
  );
}

function remove(rank){
  OrientDB.db.record.delete( rank["@rid"] ).then(
    (record) => debuger.log(rank, "deleted"),
    (error) => debuger.error(error, "deleted")
  );
}

function update(rank, user){
  OrientDB.db.record.get( rank.rid ).then(
    (record) => {
       Util.safeUpdate(record, "profileImg", user, "string");
       Util.safeUpdate(record, "name", user, "string");
			 Util.safeUpdate(record, "character", user, "string");
       record.bank = user.getBank;
       OrientDB.db.record.update(record).then(
         (result) => debuger.log(user, "rank updated"),
         (error) => debuger.error(error, "rank updated")
       )
    },
    (error) => debuger.error(error, "rank updated")
  );
}
