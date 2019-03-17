var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require("body-parser");
var logger = require('morgan');
var mongoose = require('mongoose');
var passport = require('passport'); 
var uuid = require('uuid/v4');
var session = require('express-session');
var FileStore = require('session-file-store')(session);


//Route for static files
//dispatcher.setStatic('resources')

var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var authRouter = require('./routes/auth')
var registoRouter = require('./routes/registo');
var loginRouter = require('./routes/login');
var logoutRouter = require('./routes/logout');
var authAPIRouter = require('./routes/api/auth')
var userAPIRouter = require('./routes/api/user')

require('./auth/auth');

var app = express();

//Firebase setup
var firebase = require("firebase/app");

require("firebase/auth");
//require("firebase/database");
//require("firebase/firestore");
//require("firebase/messaging");
//require("firebase/functions");

// Comment out (or don't require) services that you don't want to use
// require("firebase/storage");

// Initialize Firebase
var configFirebase = require('./lib/configFirebase.js')
var config = {
  apiKey: configFirebase['apiKey'],
  authDomain: configFirebase['authDomain'],
  databaseURL: configFirebase['databaseURL'],
  projectId: configFirebase['projectId'],
  storageBucket: configFirebase['storageBucket'],
  messagingSenderId: configFirebase['messagingSenderId']
};
firebase.initializeApp(config);

//Google firebase login
var provider = new firebase.auth.GoogleAuthProvider();
firebase.auth().useDeviceLanguage();

firebase.auth().signInWithPopup(provider).then(function(result) {
  // This gives you a Google Access Token. You can use it to access the Google API.
  var token = result.credential.accessToken;
  // The signed-in user info.
  var user = result.user;
  // ...
}).catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  // The email of the user's account used.
  var email = error.email;
  // The firebase.auth.AuthCredential type that was used.
  var credential = error.credential;
  // ...
});

/* Base de Dados */
mongoose.connect('mongodb://127.0.0.1:27017/LEI', { useNewUrlParser: true, useCreateIndex: true })
    .then(() => console.log('Mongo ready: ' + mongoose.connection.readyState))
    .catch(() => console.log('Erro na conexão à BD!'));

// Configuração da sessão.
app.use(session({
  genid: () => { return uuid(); },
  store: new FileStore({logFn: function(){}}),
  secret: 'lei',
  resave: false,
  saveUninitialized: true
}));

// Inicialização do passport.
app.use(passport.initialize());
app.use(passport.session());

// view engine setup
//var engines = require('consolidate');
app.set('views', __dirname + '/views');
app.set('view engine', 'pug')
//app.engine('html', engines.mustache);

//app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/auth', authRouter)
app.use('/registo', registoRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/api/auth', authAPIRouter)
app.use('/api/user', userAPIRouter)

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

module.exports = app;
