import createError from 'http-errors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import cookieParser from 'cookie-parser';
import logger from 'morgan';
import keys from './config/keys.cjs'
import multer from 'multer';
const upload = multer();

import indexRouter from './routes/index.mjs';
import usersRouter from './routes/users.cjs';
import catalogRouter from './routes/catalog.mjs';
import MONGOOSE from 'mongoose'
const { default: mongoose } = MONGOOSE;
import cors from 'cors'

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'pug');

// mongodb connection setup
var mongoDB = keys.mongoURI;
mongoose.connect(mongoDB, {useNewUrlParser:true});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'URLs to trust of allow');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if ('OPTIONS' == req.method) {
  res.sendStatus(200);
  } else {
    next();
  }
});
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(upload.array());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter)
app.use(cors())

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


export default app;

