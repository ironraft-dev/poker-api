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

export async function checkAccessToken (token, callback) {
  try {
    const response = await axios.get(Config.FACEBOOK_DEBUG_TOKEN_API,  {
        params: {
          'input_token': Config.FACEBOOK_APP_TOKEN,
          'access_token': token
        }
    })
    if( !response ) callback(false);
    else callback(true);
  } catch(err) {
    callback(false);
  }
}

export function getLoginToken(){
  return uuidv4();
}
