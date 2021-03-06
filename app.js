var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));

// If implementing UI, see 'consolidate' for html instead of pug, examples in auth-server
//app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* routes */
app.use('/', require('./routes/index'));
app.use('/registry/v1/', require('./routes/registry'));

// Vendor routes are just a mockup, we don't apply versioning to their endpoints
app.use('/vendors/', require('./routes/vendors'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  //res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.locals.error = err;

  console.log(JSON.stringify(err,null,2));

  // render the error page
  res.status(err.status || 500);
  res.send(JSON.stringify(err));
});

module.exports = app;
