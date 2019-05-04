var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//TODO: hash the secret
var ClientSchema = new Schema({
    name: {type: String, required: true},
    clientId: {type: String, required: true, unique: true},
    clientSecret: {type: String, required: true}
});

module.exports = mongoose.model('Client', ClientSchema, 'clients');