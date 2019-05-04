var express = require('express');
var jwt = require('jsonwebtoken');
var User = require('../../controllers/user')
var router = express.Router();
const login = require('connect-ensure-login')
const passport = require('passport')

// Get informação do client
router.get('/',
    passport.authenticate('bearer', {session: false}),
    (req, res) => {
        console.log('client api')
        res.json({ user_id: req.user.id, name: req.user.name, scope: req.authInfo.scope })
    }
)

module.exports = router