var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var formidable = require("formidable");

// GitLab nodeJS library to access GitLab API
var gitlab = require('gitlab');

// Libraries for adb installation
var Promise = require('bluebird'); // bluebird library https://www.npmjs.com/package/bluebird
var adb = require('adbkit'); // adbkit library is a nodejs client for adb https://www.npmjs.com/package/adbkit
var request = require('request'); // request library to make http calls https://www.npmjs.com/package/request
var Readable = require('stream').Readable; // stream library https://www.npmjs.com/package/stream
var client = adb.createClient();

var axios = require('axios'); // axios library https://www.npmjs.com/package/axios

// routes declared
var index = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;