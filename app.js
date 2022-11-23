var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var keys = require('./config/keys')
var multer = require('multer');
const upload = multer();
const flash = require('express-flash')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var catalogRouter = require('./routes/catalog')
const { default: mongoose } = require('mongoose');
const cors = require('cors');



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
  //Control-Allow-Origin', 'URLs to trust of allow');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
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
app.use(flash())
app.use(upload.array());

//auth
const passport = require("passport");
const passportLocal = require("passport-local").Strategy;
const session = require("express-session");
const bodyParser = require("body-parser");


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:4000"],// <-- location of the react app were connecting to
    credentials: true,
  })
);

app.use(
  session({
    secret: "secretcode",
    resave: true,
    saveUninitialized: false,
  })
);

app.use(cookieParser("secretcode"));
app.use(passport.initialize());
app.use(passport.session());

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



//require("./config/passportConfig")(passport);


module.exports = app;

