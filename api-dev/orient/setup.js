import * as OrientDB from "./db";
import Debugger from '../skeleton/log';

const debuger = new Debugger();
debuger.tag = "DB Setup"

export function init(){
   createContentClass();
   createUserClass();
   createRank();
}

function createContentClass(){
   OrientDB.db.class.create(OrientDB.Class.Content)
      .then(
         (User) => {
             debuger.log('created Content');
             User.property.create([
                {name: 'id',    type: 'String'},
                {name: 'image', type: 'String'},
                {name: 'title',  type: 'String'},
                {name: 'description',  type: 'String'},
                {name: 'pageUrl',  type: 'String'}

             ]).then(
                 (property) => {
                     debuger.log(property, 'setup Content');
                 }
             );
         },
         (error) => debuger.error(error.message, 'created Content')
      );

}

function createUserClass(){
   OrientDB.db.class.create(OrientDB.Class.User)
      .then(
         (User) => {
             debuger.log('created User');
             User.property.create([
                {name: 'id',         type: 'String'},
                {name: 'profileImg', type: 'String'},
                {name: 'name',       type: 'String'},
                {name: 'loginToken', type: 'String'},
                {name: 'snsToken',   type: 'String'},
                {name: 'bank',       type: 'Double'},
                {name: 'getBank',    type: 'Double'},
                {name: 'rank',       type: 'Double'},
                {name: 'character',  type: 'String'},
                {name: 'rankId',     type: 'String'}
             ]).then(
                 (property) => {
                     debuger.log(property, 'setup User');
                     OrientDB.db.index.create({
                         name: OrientDB.Index.User,
                         type: 'unique'
                     }).then(
                         (index) => debuger.log('created User Index'),
                         (error) => debuger.error(error.message, 'created User Index')
                     );
                 }
             );
         },
         (error) => debuger.error(error.message, 'created User')
      );

}
function createRank(){
  OrientDB.db.class.create(OrientDB.Class.RankInfo)
     .then(
        (RankInfo) => {
            RankInfo.property.create([
               {name: 'bankMin', type: 'Double'},
               {name: 'groupId', type: 'String'},
               {name: 'status',  type: 'Integer'}
            ]).then(
                (property) => {
                    debuger.log(property, 'setup RankInfo');
                    createRankInfo("0");
                    createRankInfo("1");
                    createRankInfo("2");
                }
            );
        },
        (error) => debuger.error(error.message, 'created Rank')
    );
}

export function createRankInfo(id){
  OrientDB.db.class.get(OrientDB.Class.RankInfo).then(
    (RankInfo) => {
       RankInfo.create({
         groupId: id,
         bankMin: 0,
         status: 0
      }).then(
         (rankInfo)=>{
            addRankClass(id);
         },
         (error) => debuger.error(error.message, 'created RankInfo')
       )
    },
    (error) => debuger.error(error.message, 'created RankInfo')
  );
}


function addRankClass(id){
  let className = OrientDB.Class.Rank + id;
  OrientDB.db.class.create(className)
    .then(
       (Rank) => {
           debuger.log('created ' + className);
           Rank.property.create([
              {name: 'userId',     type: 'String'},
              {name: 'profileImg', type: 'String'},
              {name: 'name',       type: 'String'},
              {name: 'character',  type: 'String'},
              {name: 'bank',       type: 'Double'}
           ]).then(
               (property) => {
                   debuger.log(property, 'setup Rank');
                   OrientDB.db.index.create({
                       name: className + OrientDB.Index.RankId ,
                       type: 'unique'
                   }).then(
                       (index) => debuger.log('created ' + className + ' Index'),
                       (error) => debuger.error(error.message, 'created ' + className + ' Index')
                   );
               }
           );

       },
       (error) => debuger.error(error.message, 'created '+className)
    );
}

function setupRankInfo(RankInfo){

}
