var express = require('express');
var jwt = require('jsonwebtoken');
var User = require('../../controllers/user')
var router = express.Router();

// Adiciona login de Google à conta
router.post('/addGoogle', function(req, res) {
    var token = req.headers.authorization
    if(token){
        jwt.verify(token, 'lei', function(err, decoded) {
            if(!err){
                var email = req.query.email
                var username = decoded.user.username
                User.addGoogle(username, email)
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

router.post('/loginGoogle', function(req, res){
    User.checkGoogle(req.query.idGoogle)
        .then(dados => res.jsonp(dados))
        .catch(erro => res.status(500).send('Erro a buscar conta: ' + erro))
})

module.exports = router;