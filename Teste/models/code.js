var mongoose = require('mongoose')
var Schema = mongoose.Schema

var CodeSchema = new Schema({
    id: {type: String, required: true, unique: true},
    clientID: {type: String, required: true},
    redirectURI: {type: String, required: true},
    userID: {type: String, required: true},
    //TODO: adicionar scope
    //scope: scopeSchema
})

module.exports = mongoose.model('Code', CodeSchema, 'codes')