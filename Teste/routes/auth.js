var express = require('express');
var axios = require('axios')
var jwt = require('jsonwebtoken');
var login = require('connect-ensure-login')
var passport = require('passport')
var https = require('https')
var router = express.Router();
var User = require('../controllers/user')

//Axios instance (so that it doesn't reject self-signed certificates)
//Can remove later when a non-self-signed cert is used
const instance = axios.create({
	httpsAgent: new https.Agent({
		rejectUnauthorized: false
	})
})

//TODO: cleanup code
//TODO: keep request or axios, not both
//TODO: move code(?) (/login?)

//Setup github
var request = require('request')
var url = require('url')
var configGithub = require('../lib/configGithub.js')
var GithubConfig = {
  'client_id'    : configGithub['client_id'],
  'secret'       : configGithub['secret'],
  'redirect_uri' : '',
  'scope'        : '',
  'state'        : Math.round(Math.random() * 10)
}

//Setup Twitter
var Twitter = require("node-twitter-api")
var secret = require('secret')
var configTwitter = require('../lib/configTwitter.js')
var twitter = new Twitter({
    consumerKey: configTwitter['consumerKey'],
    consumerSecret: configTwitter['consumerSecret'],
    callback: configTwitter['callback']
})
var requestSecret

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('auth', { title: 'Área Autenticada' });
});

router.post('/addGoogle', 
	login.ensureLoggedIn(),
	function(req, res, next){
		var email = req.body.email
		instance({
		//axios({
			method: 'post',
			url: 'https://localhost:3000/api/auth/addGoogle',
			headers: {'Authorization': req.session.token},
			data: {
				email: email
			}
		})
		.then(user => {
			req.session.passport.user = user.data
			res.redirect('/user')
		})
		.catch(erro => {
			res.render('error', {error: erro, message: 'erro no add idGoogle: ' + erro})
		})
	}
)

router.post('/addFacebook',
	login.ensureLoggedIn(),
	function(req, res, next){
		console.log(req.body)
		var id = req.body.id
		console.log("ID: "+id)
		instance({
		//axios({
			method: 'post',
			url: 'https://localhost:3000/api/auth/addFacebook',
			headers: {'Authorization': req.session.token},
			data: {
				idFacebook: id
			}
		})
			.then(user => {
				req.session.passport.user = user.data
				res.redirect('/user')
			})
			.catch(erro => {
				res.render('error', {error: erro, message: 'erro no add idGoogle: ' + erro})
			})
	}
)

//TODO: check if id_token is valid
//https://developers.google.com/identity/sign-in/web/backend-auth
router.post('/loginGoogle', function(req, res, next){
	var token = req.body.token
	var email = req.body.email
	//TODO: check if token is valid
	//if(token is valid){
	User.checkGoogle(email)
		.then(result => {
			var user = result[0]
			if(user){
				try{
					req.login(user, {session: true}, async(error) => {
						if(error){
							return next(error)
						}
						var myuser = {_id: user._id, username: user.username}
						var token = jwt.sign({user: myuser}, 'lei')
						req.session.token = token
						var redirect
						if(req.session.returnTo){
							redirect = req.session.returnTo
							req.session.returnTo = undefined
						}
						else{
							redirect = '/user'
						}
						res.jsonp(redirect)
					})	
				} catch(error){
					res.redirect('/login')
				}
			}
		})
})

router.post('/loginFacebook', function(req, res, next){
	request.get(
        {
            url: 'https://graph.facebook.com/me?fields=name&access_token='+req.body.token,
            headers: {'Headers': 'Content-type:application/json'}
        },
        function(error, response, body){
			var obj = JSON.parse(response.body)
			var id = obj.id
			User.checkFacebook(id)
				.then(result => {
					var user = result[0]
					if(user){
						try{
							req.login(user, {session: true}, async(error) => {
								if(error){
									return next(error)
								}
								var myuser = {_id: user._id, username: user.username}
								var token = jwt.sign({user: myuser}, 'lei')
								req.session.token = token
								var redirect
								if(req.session.returnTo){
									redirect = req.session.returnTo
									req.session.returnTo = undefined
								}
								else{
									redirect = '/user'
								}
								res.jsonp(redirect)
							})	
						} catch(error){
							res.redirect('/login')
						}
					}
				})
		}
	)
})

router.get('/loginGithub', function(req, res){
    var url = 'https://github.com/login/oauth/authorize'
        + '?client_id=' + GithubConfig.client_id
        + (GithubConfig.scope ? '&scope=' + GithubConfig.scope : '')
        + '&state=' + GithubConfig.state;
    
    res.setHeader('location', url)
    res.statusCode = 302;
    res.end();
})

//TODO: mudar de response para axios
router.get('/callbackGithub', function(req, res, next){
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
                authorized(req, res, token, next)
			}
			if(error){
				console.log(error)
			}
        })
    }
})

var authorized = function(req, res, token, next){
    request.get(
        {
            url: 'https://api.github.com/user',
            headers: {'Authorization': 'token '+token, 'User-Agent': req.get('User-Agent')}
        },
        function(error, response, body){
            if(!error && response.statusCode == 200){
                body = JSON.parse(body)
                var id = body.id
				if(req.session.token){
					jwt.verify(req.session.token, 'lei', function(errVerify, decoded){
						if(!errVerify){
							console.log('pre addGithub')
							instance({
							//axios({
								method: 'post',
								url: 'https://localhost:3000/api/auth/addGithub',
								headers: {'Authorization': req.session.token},
								data: {
									idGithub: id
								}
							})
							.then(user => {
								req.session.passport.user = user.data
								res.redirect('/user')
							})
							.catch(erro => {
								res.render('error', {error: erro, message: 'erro no add idGithub: ' + erro})
							})
						}
						else{
							res.redirect('/')
						}
					})
				}
				else{
					User.checkGithub(id)
					.then(result => {
						var user = result[0]
						if(user){
							try{
								req.login(user, {session: true}, async(error) => {
									if(error){
										return next(error)
									}
									var myuser = {_id: user._id, username: user.username}
									var token = jwt.sign({user: myuser}, 'lei')
									req.session.token = token
									if(req.session.returnTo){
										var redirect = req.session.returnTo
										req.session.returnTo = undefined
										res.redirect(redirect)   
									}
									else{
										res.redirect('/')
									}
								})	
							} catch(error){
								res.redirect('/login')
							}
						}
					})
				}
            }
        else {
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
						else if(req.session.token){
							jwt.verify(req.session.token, 'lei', function(errVerify, decoded){
								if(!errVerify){
									var id = user.id
									console.log('pre addGithub')
									instance({
									//axios({
										method: 'post',
										url: 'https://localhost:3000/api/auth/addTwitter',
										headers: {'Authorization': req.session.token},
										data: {
											idTwitter: id
										}
									})
									.then(user => {
										req.session.passport.user = user.data
										res.redirect('/user')
									})
									.catch(erro => {
										res.render('error', {error: erro, message: 'erro no add idGithub: ' + erro})
									})
								}
								else{
									res.redirect('/')
								}
							})
						}
                        else{
							var id = user.id
							User.checkTwitter(id)
							.then(result => {
								var user = result[0]
								if(user){
									try{
										req.login(user, {session: true}, async(error) => {
											if(error){
												return next(error)
											}
											var myuser = {_id: user._id, username: user.username}
											var token = jwt.sign({user: myuser}, 'lei')
											req.session.token = token
											if(req.session.returnTo){
												var redirect = req.session.returnTo
												req.session.returnTo = undefined
												res.redirect(redirect)   
											}
											else{
												res.redirect('/')
											}
										})	
									} catch(error){
										res.redirect('/login')
									}
								}
							})
                        }
                    })
            }
        }
    )
})

module.exports = router;