var express = require('express');
var passport = require('passport');
var router = express.Router();

//http://localhost:3000/oauth/dialog/authorize?redirect_uri=http://localhost:3000/teste&response_type=code&client_id=abc123&scope=offline_access

/* Get signup. */
router.get('/', function(req, res) {
    if(req.query.code){
        console.log('code')
        console.log(req.query.code)
    }
    else if(req.params.error){

    }
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