var express = require('express');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var firebase = require('firebase/app')
var router = express.Router();

//Setup github
var http = require('http')
//var dispatcher = require('httpdispatcher')
var request = require('request')
var url = require('url')
//NAO POR ESTE FICHEIRO NO GITHUB
var configGithub = require('../lib/configGithub.js')
var GithubConfig = {
  'client_id'    : configGithub['client_id'],
  'secret'       : configGithub['secret'],
  'redirect_uri' : '',
  'scope'        : '',
  'state'        : Math.round(Math.random() * 10)
}

//Setup Twitter
var Twitter = require("node-twitter-api"),
    secret = require("secret");

var configTwitter = require('../lib/configTwitter.js')
var twitter = new Twitter({
    consumerKey: configTwitter['consumerKey'],
    consumerSecret: configTwitter['consumerSecret'],
    callback: configTwitter['callback']
})
var requestSecret

/* Get login. */
router.get('/', function(req, res) {
    res.render('login');
})

/* Verifica se utilizador tem login feito. */
router.get('/verificaLogin', function(req, res){
    if (req.session.token) {
        jwt.verify(req.session.token, 'ibanda', function(err, decoded) {
            res.end('{\"Success\" : \"Logged in!\", \"status\" : 200}');
        })(req, res, next);
    } else {
        return next(error);
    }
})

/* Login de um utilizador. */
router.post('/processaLogin', async (req, res, next) => {
    passport.authenticate('login', async (err, user, info) => {     
        try {
            if (err || !user) {
                return next(err);
            }
            
            req.login(user, { session : false }, async (error) => {
                if (error) {
                    return next(error);
                }
                console.log('user: '+user);
                var myuser = { _id : user._id, username : user.username };
                // Geração do token
                var token = jwt.sign({ user : myuser }, 'lei');
                req.session.token = token;
                res.redirect('/user')
            });
        } catch (error) {
            return next(error);
        }
    })(req, res, next);
});

router.post('/processaLoginAlt', async(req, res, next) => {
    console.log(req.query)
    var user = {username: req.query.username}
    console.log('user alt: '+user)
    try{
        req.login(user, {session: false}, async(error) => {
            if(error){
                console.log('erro no login')
                return next(error)
            }
            console.log('pos login: '+user)
            var myuser = { _id: user._id, username: user.username}
            var token = jwt.sign({user: myuser}, 'lei')
            req.session.token = token
            console.log(req.session.token)
            res.end()
        })
    } catch (error) {
        return next(error);
    }
})

/*router.post('/loginGoogle', async (req, res, next) => {
    var id_token = req.body.token
    var email = req.body.email

    //console.log(id_token)

    // Build Firebase credential with the Google ID token.
    var credential = firebase.auth.GoogleAuthProvider.credential(id_token);
    //console.log(credential);

    // Sign in with credential from the Google user.
    // Returns non-null promise with credential
    firebase.auth().signInAndRetrieveDataWithCredential(credential)
    .then(function(credential){
        //console.log(credential)
        // Check if user is logged in
        if(firebase.auth().currentUser){
            //console.log("user logged in")
        }
    })
    .catch(function(error) {
        // Handle errors
        console.log(error.code);
        console.log(error.message)
    });

})*/

router.get('/loginGithub', function(req, res){
    var url = 'https://github.com/login/oauth/authorize'
        + '?client_id=' + GithubConfig.client_id
        + (GithubConfig.scope ? '&scope=' + GithubConfig.scope : '')
        + '&state=' + GithubConfig.state;
    
    res.setHeader('location', url)
    res.statusCode = 302;
    res.end();
})

router.get('/callbackGithub', function(req, res){
    var query = url.parse(req.url, true).query
    if(query.state == GithubConfig.state){
        payload = {
            'code'          : query.code,
            'client_id'     : GithubConfig.client_id,
            'client_secret' : GithubConfig.secret
        }
        request.post({
            url: 'https://github.com/login/oauth/access_token',
            formData: payload,
            headers: {'Accept': 'application/json'}
        }, function(error, response, body){
            if(!error && response.statusCode == 200){
                var token = JSON.parse(body).access_token
                res.statusCode = 302
                console.log('token: ' + token)
                authorized(req, res, token)
            }
        })
    }
})

var authorized = function(req, res, token){
    request.get(
        {
            url: 'https://api.github.com/user',
            headers: {'Authorization': 'token '+token, 'User-Agent': req.get('User-Agent')}
        },
        function(error, response, body){
            if(!error && response.statusCode == 200){
                body = JSON.parse(body)
                var username = body.login
                var id = body.id
                console.log(username)
                console.log(id)
                res.redirect('http://localhost:3000/')
            }
        else {
            console.log(body)
            res.end(body)
        }
    })
}

router.get('/loginTwitter', function(req, res){
    twitter.getRequestToken(function(err, requestToken, reqSecret){
        if(err){
            res.status(500).send(err)
        }
        else{
            requestSecret = reqSecret
            res.redirect('https://api.twitter.com/oauth/authenticate?oauth_token=' + requestToken)
        }
    }) 
})

router.get('/callbackTwitter', function(req, res){
    var requestToken = req.query.oauth_token
    var verifier = req.query.oauth_verifier

    twitter.getAccessToken(requestToken, requestSecret, verifier,
        function(err, accessToken, accessSecret){
            if(err){
                res.status(500).send(err)
            }
            else{
                twitter.verifyCredentials(accessToken, accessSecret,
                    function(err2, user){
                        if(err2){
                            res.status(500).send(err2)
                        }
                        else{
                            var id = user.id
                            var name = user.screen_name
                            console.log(id)
                            console.log(name)
                            res.redirect('http://localhost:3000')
                        }
                    })
            }
        }
    )
})

module.exports = router;