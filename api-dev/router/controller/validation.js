import * as Config from  "../../config";
import axios from "axios"
import Debugger from '../../skeleton/log';
import uuidv4 from 'uuid/v4';
const debuger = new Debugger();
debuger.tag = "Validation"

export function checkId (userId, currentUserid) {
  return userId === currentUserid;
}

export function checkAuth (userId, currentUserid) {
  return userId === currentUserid;
}

export function checkLoginToken (loginToken, currentLoginToken) {
  return loginToken === currentLoginToken;
}

export function checkServerKey (serverId, serverKey) {
  return serverKey === Config.SERVER_KEY;
}

export async function checkAccessToken (token, callback) {
  try {
    debuger.log(token, "user token");
    const response = await axios.get(Config.FACEBOOK_TOKEN_API,  {
        params: {
          'input_token': Config.FACEBOOK_APP_TOKEN,
          'access_token': token
        }
    })
    debuger.log(response, "response");
    if( !response ) callback(false);
    else callback(true);
  } catch(err) {

    debuger.log(err, "response");
    callback(false);
  }
}

export function getLoginToken(){
  return uuidv4();
}
