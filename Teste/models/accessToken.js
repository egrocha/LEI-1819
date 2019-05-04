var mongoose = require('mongoose')
var Schema = mongoose.Schema

var AccessTokenSchema = new Schema({
    token: {type: String, required: true},
    expirationDate: {type: String, require: true},
    userID: {type: String, required: true},
    clientID: {type: String, required: true},
    scope: {type: String, required: true}
})

module.exports = mongoose.model('AccessToken', AccessTokenSchema, 'accesstokens')