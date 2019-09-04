import Debugger from '../../skeleton/log';

const debuger = new Debugger();
debuger.tag = "Util"

export function safeUpdate(record, key, value, type = "string"){
  let data = (typeof value == type) ? value : value[key];
  if(data === null) return;
  if(data === undefined) return;
  if(isNaN(data)) return;
  if(typeof data != type) throw new Error("invalid data [" + key + "] -> " + type);
  record[key] = data;
  debuger.log(record[key], "record[key]");
}
