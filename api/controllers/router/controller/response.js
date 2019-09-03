"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getValidationError = getValidationError;
exports.getAccessTokenError = getAccessTokenError;
exports.getUnregisteredError = getUnregisteredError;
exports.getBadRequestError = getBadRequestError;
exports.getDBError = getDBError;
exports.ResponseCode = exports.StatusCode = exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var Response = function Response() {
  (0, _classCallCheck2["default"])(this, Response);
  this.code = '';
  this.message = "";
  this.data = {};
};

exports["default"] = Response;
var StatusCode = Object.freeze({
  Success: '200',
  Create: '201',
  BadRequest: '400',
  Unauthorized: '401',
  Forbidden: '403',
  NotFound: '404',
  MethodNotAllowed: '405',
  NotAcceptable: '406',
  Conflict: '409',
  InternalServerError: '500',
  ServiceUnavailable: '503'
});
exports.StatusCode = StatusCode;
var ResponseCode = Object.freeze({
  Success: '200',
  DBError: '901',
  DuplicatedKey: '902',
  UndefinedKey: '903',
  InvalidDataType: '904',
  UnauthorizedApiKey: '905',
  UnauthorizedAccessToken: '906',
  ValidationUserId: '907',
  ValidationLoginToken: '908',
  ValidationServerKey: '909',
  UnregisteredData: '910'
});
exports.ResponseCode = ResponseCode;

function getValidationError() {
  var code = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ResponseCode.ValidationUserId;
  var response = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Response();
  response.code = code;
  response.message = 'validation invalid';
  return {
    statusCode: StatusCode.Unauthorized,
    response: response
  };
}

function getAccessTokenError() {
  var response = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Response();
  response.code = ResponseCode.UnauthorizedAccessToken;
  response.message = 'accessToken invalid';
  return {
    statusCode: StatusCode.Unauthorized,
    response: response
  };
}

function getUnregisteredError() {
  var response = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Response();
  response.code = ResponseCode.UnregisteredData;
  response.message = "unregistered data";
  return {
    statusCode: StatusCode.BadRequest,
    response: response
  };
}

function getBadRequestError(error, code) {
  var response = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new Response();
  response.code = code;
  response.message = error.message;
  return {
    statusCode: StatusCode.BadRequest,
    response: response
  };
}

function getDBError(error) {
  var response = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Response();
  response.code = ResponseCode.DBError;
  response.message = error.message;
  return {
    statusCode: StatusCode.InternalServerError,
    response: response
  };
}