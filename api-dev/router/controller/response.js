

export default class Response {
  constructor() {
    this.code = '';
    this.message = "";
    this.data = {};
  }
}

export const StatusCode = Object.freeze ({
  Success : '200',
  Create : '201',
  BadRequest : '400',
  Unauthorized : '401',
  Forbidden : '403',
  NotFound : '404',
  MethodNotAllowed : '405',
  NotAcceptable : '406',
  Conflict : '409',
  InternalServerError : '500',
  ServiceUnavailable : '503'
});

export const ResponseCode = Object.freeze ({
  Success : '200',
  DBError : '901',
  DuplicatedKey : '902',
  UndefinedKey : '903',
  InvalidDataType : '904',
  UnauthorizedApiKey : '905',
  UnauthorizedAccessToken : '906',
  ValidationUserId : '907',
  ValidationLoginToken : '908',
  ValidationServerKey : '909',
  UnregisteredData : '910',
});

export function getValidationError(code = ResponseCode.ValidationUserId, response = new Response()){
  response.code = code;
  response.message = 'validation invalid';
  return {statusCode: StatusCode.Unauthorized, response:response};
}

export function getAccessTokenError(response = new Response()){
  response.code = ResponseCode.UnauthorizedAccessToken;
  response.message = 'accessToken invalid';
  return {statusCode: StatusCode.Unauthorized, response:response};
}

export function getUnregisteredError(response = new Response()){
  response.code = ResponseCode.UnregisteredData;
  response.message = "unregistered data"
  return {statusCode: StatusCode.BadRequest, response:response};
}

export function getBadRequestError(error,code,response = new Response()){
  response.code = code;
  response.message = error.message;
  return {statusCode: StatusCode.BadRequest, response:response};
}

export function getDBError(error, response = new Response()){
  response.code = ResponseCode.DBError;
  response.message = error.message;
  return {statusCode: StatusCode.InternalServerError, response:response};

}
