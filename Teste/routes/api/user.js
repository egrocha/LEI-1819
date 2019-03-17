var express = require('express');
var jwt = require('jsonwebtoken');
var User = require('../../controllers/user')
var router = express.Router();

// Get informação do utilizador
router.get('/', function(req, res) {
    var token = req.headers.authorization
    if(token){
        jwt.verify(token, 'lei', function(err, decoded) {
            if(!err){
                var username = decoded.user.username
                User.getUser(username)
                    .then(dados => res.jsonp(dados))
                    .catch(erro => res.status(500).send('Erro na edição: ' + erro));
            }
            else{
                res.redirect('/');
            }
        });
    } 
    else{
        res.redirect('/');
    }
});

module.exports = router;