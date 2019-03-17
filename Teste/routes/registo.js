var express = require('express');
var passport = require('passport');
var router = express.Router();

/* Get registo. */
router.get('/', function(req, res) {
    res.render('registo');
});

/* Registo de um utilizador. */
router.post('/', function(req, res, next) {
    passport.authenticate('registo', function(err, user, info) {
        console.log(user)
        console.log(err)
        console.log(info)
        if (user)
            return res.redirect(307, '/login/processaLogin');
        else
            console.log('erro no registo')
            return res.redirect('/registo');
    }, { session : false })(req, res, next);
});

module.exports = router;