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

module.exports.addGoogle = (username, email) => {
    return User.findOneAndUpdate({username: username}, {$set:{idGoogle: email}}, {new: true})
}

module.exports.addFacebook = (username, id) => {
    return User.findOneAndUpdate({username: username}, {$set: {idFacebook: id}}, {new: true})
}

module.exports.addGithub = (username, id) => {
    return User.findOneAndUpdate({username: username}, {$set: {idGithub: id}}, {new: true})
}

module.exports.addTwitter = (username, id) => {
    return User.findOneAndUpdate({username: username}, {$set: {idTwitter: id}}, {new: true})
}

module.exports.checkGoogle = (idGoogle) => {
    return User.find({idGoogle: idGoogle})
}

module.exports.checkFacebook = (idFacebook) => {
    return User.find({idFacebook: idFacebook})
}

module.exports.checkGithub = (idGithub) => {
    return User.find({idGithub: idGithub})
}

module.exports.checkTwitter = (idTwitter) => {
    return User.find({idTwitter: idTwitter})
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
