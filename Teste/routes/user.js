var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var axios = require('axios')

/* GET user information. */
router.get('/', function(req, res, next) {
	if(req.session.token){
		jwt.verify(req.session.token, 'lei', function(err, decoded){
			if(!err){
				console.log(decoded)
				var username = decoded.user.username
				axios({ method: 'get', url: 'http://localhost:3000/api/user', headers: { 'Authorization': req.session.token } })
					.then(user => res.render('user', {user: user.data}))
					.catch(erro => {
						console.log('Erro no get do utilizador: ' + erro);
						res.render('error', { error: erro, message: "Erro no get do user" });
					});
			}
			else{
				res.redirect('/')
			}
		})
	}
	else{
		res.redirect('/')
	}
});

module.exports = router;
