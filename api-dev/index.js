import app from "../../app";
import Debugger from './skeleton/log';
import bodyParser from "body-parser";
import methodOverride from "method-override";
import get from "./router/get";
import post from "./router/post";
import put from "./router/put";
import del from "./router/del";
import cors from  "cors";
import * as OrientDB from "./orient/db";
import * as Setup from "./orient/setup";
import Response, * as Res from  "./router/controller/response";
import * as Config from  "./config";

const debuger = new Debugger();
debuger.tag = "INDEX"

var corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE"
}

app.use(cors(corsOptions));
app.use('/api',checkAuthorization);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use('/api', get);
app.use('/api', put);
app.use('/api', post);
app.use('/api', del);
app.use(logErrors);
app.use(errorHandler);


function checkAuthorization(req, res, next) {
  debuger.log(req.method + " | " + req.originalUrl);
  if(Config.API_KEY === req.query.api_key) next();
  else {
    let response = new Response();
    response.code = Res.ResponseCode.UnauthorizedApiKey;
    response.message = 'API key is missing or invalid';
    let errorData = {statusCode: Res.StatusCode.Unauthorized, response:response};
    next(errorData);
  }
}

function logErrors(err, req, res, next) {
  debuger.error(err, req.method + " | " + req.originalUrl);
  next(err);
}

function errorHandler(err, req, res, next) {
  res.status(err.statusCode).json(err.response);
}
Setup.init();
