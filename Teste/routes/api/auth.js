var express = require('express');
var jwt = require('jsonwebtoken');
var User = require('../../controllers/user')
var router = express.Router();
const login = require('connect-ensure-login')

// Adiciona login de Google à conta
/*router.post('/addGoogle', 

    function(req, res){
        var email = req.body.email
        var username = req.session.passport.user.username
        console.log(email)
        console.log(username)
        User.addGoogle(username, email)
            .then(dados => res.jsonp(dados))
            .catch(erro => res.status(500).send('Erro em adição de idGoogle: ' + erro))
    }  
)*/

router.post('/addGoogle', function(req, res) {
    console.log('api add google')
    var token = req.headers.authorization
    if(token){
        jwt.verify(token, 'lei', function(err, decoded) {
            if(!err){
                var email = req.body.email
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

// Adiciona login de Facebook à conta
router.post('/addFacebook', function(req, res) {
    var token = req.headers.authorization
    if(token){
        jwt.verify(token, 'lei', function(err, decoded) {
            if(!err){
                var idFacebook = req.body.idFacebook
                var username = decoded.user.username
                User.addFacebook(username, idFacebook)
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

// Adiciona login de Github à conta
router.post('/addGithub', function(req, res) {
    var token = req.headers.authorization
    if(token){
        jwt.verify(token, 'lei', function(err, decoded) {
            if(!err){
                var idGithub = req.body.idGithub
                var username = decoded.user.username
                User.addGithub(username, idGithub)
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

// Adiciona login de Twitter à conta
router.post('/addTwitter', function(req, res) {
    var token = req.headers.authorization
    if(token){
        jwt.verify(token, 'lei', function(err, decoded) {
            if(!err){
                var idTwitter = req.body.idTwitter
                var username = decoded.user.username
                User.addTwitter(username, idTwitter)
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
    User.checkGoogle(req.body.login)
        .then(dados => res.jsonp(dados))
        .catch(erro => res.status(500).send('Erro a buscar conta: ' + erro))
})

router.post('/loginFacebook', function(req, res){
    User.checkFacebook(req.body.login)
        .then(dados => {console.log(dados);res.jsonp(dados)})
        .catch(erro => res.status(500).send('Erro a buscar conta: ' + erro))
})

router.post('/loginGithub', function(req, res){
    User.checkGithub(req.body.login)
        .then(dados => res.jsonp(dados))
        .catch(erro => res.status(500).send('Erro a buscar conta: ' + erro))
})

router.post('/loginTwitter', function(req, res){
    User.checkTwitter(req.body.login)
        .then(dados => res.jsonp(dados))
        .catch(erro => res.status(500).send('Erro a buscar conta: ' + erro))
})

module.exports = router;