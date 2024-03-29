var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');
var session = require('express-session');
var databaseHandler = require('./database/databaseHandler');
var omdb = require('./database/external/omdb');

var routes = require('./routes/index');
var users = require('./routes/users');
var api = require('./routes/api');

var app = express();

// view engine setup
app.use(express.static(__dirname + '/public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(session({
    secret: '1',
    resave: false,
    saveUninitialized: true
}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/js')));

app.use('/', routes);
app.use('/users', users);
app.use('/api', api);
 app.get('/omdb/:omdbId', function(req,res) {
      omdb.getMoviesById(req.params.omdbId, function(movie) {
        databaseHandler.addMovie(movie);
      });
   res.redirect('/');
});

//initialise the database connection
var result = databaseHandler.startDb();

//handle the promise results
result.onFulfill( function(status) {
   console.log(status);
});
result.onReject(function (status) {
    throw new Error(status);
});

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
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
