var express = require('express');
var axios = require('axios')
var router = express.Router();
var jwt = require('jsonwebtoken');

/* GET home page. */
router.get('/', function(req, res, next) {
	
	res.render('auth', { title: 'Área Autenticada' });

});

router.post('/addGoogle', function(req, res, next){
	if(req.session.token){
		jwt.verify(req.session.token, 'lei', function(err, decoded){
			if(!err){
				var email = req.body.email
				axios({ method: 'post', url: 'http://localhost:3000/api/auth/addGoogle?email='+email, headers: { 'Authorization': req.session.token } })
					.then(user => res.render('user', {user: user.data}))
					.catch(erro => {
						console.log('Erro na adição de idGoogle: ' + erro);
						res.render('error', { error: erro, message: "erro na adição de idGoogle" });
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
})

router.post('/loginGoogle', function(req, res, next){
	var email = req.body.email
	axios({ method: 'post', url: 'http://localhost:3000/api/auth/loginGoogle?idGoogle=' + email})
		.then(user => {
			if(user){
				res.redirect(307, '/login/processaLoginAlt?username='+user.data[0].username)
			}
			else{
				console.log('Utilizador não existe!')
				res.redirect('/login')
			}
		})
		.catch(erro => {
			console.log('Erro na adição de idGoogle: ' + erro);
			res.render('error', { error: erro, message: "erro na adição de idGoogle" });
		});
})

module.exports = router;
