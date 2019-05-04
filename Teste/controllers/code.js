var Code = require('../models/code')
const jwt = require('jsonwebtoken')

/* Guarda um código de autorização */
module.exports.save = (code, clientID, redirectURI, userID, scope) => {
    const id = jwt.decode(code).jti
    //TODO: adicionar scope à base de dados
    var newCode = {id, clientID, redirectURI, userID /*, scope*/}
    return Code.create(newCode)
}

/* Elimina um código de autorização */
module.exports.delete = (token) => {
    const id = jwt.decode(token).jti
    //var code = Code.findOne({id: id})
    return Code.findOneAndDelete({id: id})
    //return code
}