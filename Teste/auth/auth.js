var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var UserModel = require('../models/user');

/* Registo de um utilizador. */
passport.use('registo', new localStrategy({
    usernameField: 'username', 
    passwordField: 'password'
}, async(username, password, done) => {
    try {
        var user = await UserModel.create({username, password});
        console.log("registo feito")
        return done(null, user);
    } catch (error) {
        console.log('registo mal feito :(')
        return done(error);
    }
}));

/* Login de utilizadores. */
passport.use('login', new localStrategy({
    usernameField: 'username',
    passwordField: 'password'
}, async(username, password, done) => {
    try {
        var user = await UserModel.findOne({username});
        if (!user)
            return done(null, false, { message: 'Utilizador não existe' });
        
        var valid = await user.isValidPassword(password);
        if (!valid)
            return done(null, false, { message: 'Password inválida' });    
        
        return done(null, user, { message: 'Login feito com sucesso' });
    } catch (error) {
        return done(error);
    }
}));

var JWTStrategy = require('passport-jwt').Strategy;
var ExtractJWT = require('passport-jwt').ExtractJwt;

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
