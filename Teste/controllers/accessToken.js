const AccessToken = require('../models/accessToken')

module.exports.checkToken = function(accessToken){
    return AccessToken.findOne({token: accessToken})
}

module.exports.insert = function(token, expirationDate, userID, clientID, scope){
    console.log('SCOPE: ' + scope)
    const newToken = {token, expirationDate, userID, clientID, scope}
    return AccessToken.create(newToken)
}