var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    idGoogle: {type: String, required: false},
    idFacebook: {type: String, required: false},
    idGithub: {type: String, required: false},
    idTwitter: {type: String, required: false}
});

UserSchema.pre('save', async function(next) {
    var hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();
});

UserSchema.methods.isValidPassword = async function(password) {
    var user = this; 
    var compare = await bcrypt.compare(password, user.password);
    return compare;
}

module.exports = mongoose.model('User', UserSchema, 'users');