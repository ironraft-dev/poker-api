import Debugger from '../../skeleton/log';
import * as OrientDB from "../../orient/db";
import Response, * as Res from  "./response";
import * as Validation from  "./validation";
import * as Util from  "./util";
import * as Config from  "../../config";

const debuger = new Debugger();
debuger.tag = "Content"

export function lists(req, res, next, response = new Response()){
  OrientDB.db.class.get(OrientDB.Class.Content).then(
    (Content) => {
       Content.list().then(
         (contents)=>{
           response.code = Res.ResponseCode.Success;
           response.data = contents;
           res.status(Res.StatusCode.Success).json(response);
         }
       )
    },
    (error) => {
       next(Res.getDBError(error, response));
    }
  );
}
