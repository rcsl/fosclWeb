var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
//const { check, validationResult } = require('express-validator');

var helmet = require('helmet');


var config = require('./config.js');


var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(helmet());
app.use(logger('dev'));

// check this!!
app.use(express.json());
app.use(express.urlencoded()); //Parse URL-encoded bodies
// app.json(); included in 4.16
// app.bodyParser.urlencoded();
// app.use(expressValidator({
//   customValidators:{
//     isValidId : function (value, array){
//       // expect an array of valid objects that contain an field called id
//       return array.some(i => {
//         return i.id==parseInt(value);
//       }); 
//   }
// }
// }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user

if (app.get('env') === 'production') {
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
}

module.exports = app;
