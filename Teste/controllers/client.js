var Client = require('../models/client')

module.exports.findClientById = function(clientID){
    return Client.findOne({clientId: clientID})
}

module.exports.find = function(id){
    return Client.findOne({_id: id})
}