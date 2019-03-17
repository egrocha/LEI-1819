var bcrypt = require('bcrypt');
var User = require('../models/user');

/* Procura um utilizador no sistema pelo seu email. */
module.exports.getUser = function(email) {
    return User
        .find( { username: email } )
        .exec();
}

module.exports.listar = () => {
    return User
        .find()
        .exec();
}

module.exports.inserir = user => {
    return User.create(user);
}

module.exports.addGoogle = (username, token) => {
    return User.updateOne({username: username}, {idGoogle: token})
}

module.exports.checkGoogle = (idGoogle) => {
    return User.find({idGoogle: idGoogle})
}

module.exports.remove = user => {
    return User.deleteOne(user);
}

module.exports.editUsername = (oldUsername, newUsername) => {
    return User.updateOne({ username: oldUsername }, { username: newUsername });
}

module.exports.editPassword = (user, pass) => {
    var hash = bcrypt.hashSync(pass, 10);

    return User.updateOne({ username: user }, { password: hash });
}
