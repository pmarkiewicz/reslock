"use strict"

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const db = require('./models/reslock');
//const session = require('express-session');
//const MongoStore = require('connect-mongo')(session);

const routes = require('./routes/index');
const users = require('./routes/users');
const resources = require('./routes/resources');

const app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(1337);

io.on('connection', function (socket) {
    //socket.emit('news', { hello: 'world' });
    socket.on('change', function (data) {
        console.log(data);
        socket.broadcast.emit('change', data);
        data['updatedAt'] = new Date();
        db.findByIdAndUpdate(data.id, data)
        .then(function (resources) {
            console.log(resources);
        })
        .catch(function (err) {
            console.log(err);
        });
    });
});

mongoose.connect('mongodb://localhost/reslock')
    .catch(function (err) {
        console.log('connection error', err);
    })
    .then(function () {
        console.log('connection successful');
    });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

/*
app.use(session({
    secret: 'top-secret',
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));
*/

app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    if (req.is('json')) {
        console.log('json');
        //res.status(401).end();
        next();
    }
    else {
        next();
    }
});


app.use('/', routes);
app.use('/users', users);
app.use('/resources', resources);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
