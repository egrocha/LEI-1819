var express = require('express');
var passport = require('passport');
var router = express.Router();

/* Get signup. */
router.get('/', function(req, res) {
    res.render('signup');
});

/* Registo de um utilizador. */
router.post('/', function(req, res, next) {
    passport.authenticate('signup', function(err, user, info) {
        console.log(user)
        console.log(err)
        console.log(info)
        if(user){
            return res.redirect(307, '/login');
        }
        else{
            console.log('erro no registo')
            return res.redirect('/signup');
        }
    }, { session : false })(req, res, next);
});

module.exports = router;