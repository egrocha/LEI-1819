var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var JWTStrategy = require('passport-jwt').Strategy;
const {Strategy: ClientPasswordStrategy} = require('passport-oauth2-client-password')
const {Strategy: BearerStrategy} = require('passport-http-bearer')
var ExtractJWT = require('passport-jwt').ExtractJwt;
var User = require('../models/user');
const Client = require('../controllers/client')
const validate = require('../utils/validate')
const AccessToken = require('../controllers/accessToken')

/* Registo de um utilizador. */
passport.use('signup', new LocalStrategy({
    usernameField: 'username', 
    passwordField: 'password'
}, async(username, password, done) => {
    try {
        var user = await User.create({username, password})
        return done(null, user)
    } catch (error) {
        return done(error)
    }
}));

/* Login de utilizadores. */
passport.use('login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
}, async(username, password, done) => {
    try{
        var user = await User.findOne({username})
        if(!user){
            return done(null, false, { message: 'Utilizador não existe' })
        }
        var valid = await user.isValidPassword(password)
        if(!valid){
            return done(null, false, {message: 'Password inválida'})    
        }
        return done(null, user, {message: 'Login feito com sucesso'})
    } catch(error){
        return done(error)
    }
}));

passport.use('alt', new LocalStrategy({
    usernameField: 'username'
}, async(username, done) => {
    try {
        var user = await User.findOne({username});
        if(!user){
            return done(null, false, { message: 'Utilizador não existe' });
        }
        return done(null, user, { message: 'Login feito com sucesso' });
    } catch (error) {
        return done(error);
    }
}));

passport.use('client', new ClientPasswordStrategy((clientId, clientSecret, done) => {
    console.log('CLIENT STRAT')
    Client.findClientById(clientId)
    .then(client => validate.client(client, clientSecret))
    .then(client => done(null, client))
    .catch(() => done(null, false))
}))

passport.use('bearer', new BearerStrategy((accessToken, done) => {
    console.log('BEARER STRAT')
    //db.accessTokens.find(accessToken)
    AccessToken.checkToken(accessToken)
    .then(token => validate.token(token, accessToken))
    .then(token => done(null, token, {scope: '*'}))
    .catch(() => done(null, false))
}))

var extractFromSession = function(req) {
    var token = null;
    if (req && req.session) 
        token = req.session.token;
    
    return token;
}

passport.use(new JWTStrategy({
    secretOrKey: 'lei',
    jwtFromRequest: ExtractJWT.fromExtractors([extractFromSession])
}, async(token, done) => {
    try {
        return done(null, token.user);
    } catch (error) {
        return done(error);
    }
}))

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

exports.isAuthenticated = passport.authenticate(['login', 'bearer'], {session: false})
exports.isClientAuthenticated = passport.authenticate('client-basic', {session: false})
exports.isBearerAuthenticated = passport.authenticate('bearer', {session: false})