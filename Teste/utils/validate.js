const Client = require('../controllers/client')
const options = require('./options')
const utils = require('./utils')
const process = require('process')
const AccessToken = require('../controllers/accessToken')
//const db = require('../db')

const validate = Object.create(null)
const suppressTrace = process.env.OAUTHRECIPES_SURPRESS_TRACE === 'true';

/**
 * Fazer log de uma mensagem e enviá-la como um Error
 */
validate.logAndThrow = (message) => {
    if(!suppressTrace){
        console.trace(message)
    }
    throw new Error(message)
}

/**
 * Dado um código de autorização, um client e um redirectURI,
 * verifica se o código de autorização existe e é válido e 
 * retorna-o caso seja
 */
validate.authCode = (code, authCode, client, redirectURI) => {
    utils.verifyToken(code)
    if(client.clientId !== authCode.clientID){
        validate.logAndThrow('AuthCode clientID does not match client id given')
    }
    if(redirectURI !== authCode.redirectURI){
        validate.logAndThrow('AuthCode redirectURI does not match redirect URI given')
    }
    return authCode
}

/**
 * Verifica se o scope é "offline_access"
 */
//validate.isRefreshToken = ({scope}) => scope != null && scope.indexOf('offline_access') === 0

/**
 * Gera um token de refresh
 */
//validate.generateRefreshToken = ({userID, clientID, scope}) => {
//    const refreshToken = utils.createToken({sub: userID, exp: options.refreshToken.expiresIn})
//    return db.refreshTokens.save(refreshToken, userID, clientID, scope)
//    .then(() => refreshToken)
//}

/**
 * Gera um token de acesso
 */
validate.generateToken = ({userID, clientID, scope}) => {
    const token = utils.createToken({sub: userID, exp: options.token.expiresIn})
    const expiration = options.token.calculateExpirationDate()
    //return db.accessTokens.save(token, expiration, userID, clientID, scope)
    if(scope === undefined){ 
        scope = '*'
    }
    return AccessToken.insert(token, expiration, userID, clientID, scope)
    .then(() => console.log(token))
    .then(() => token)
}

/**
 * Recebe como argumento um código e gera tokens de acesso 
 * e de refresh e devolve ambos, caso o código seja de 
 * autorização. Se o código for um token de refresh, devolve 
 * apenas um token de acesso.
 */
validate.generateTokens = (authCode) => {
    /*if(validate.isRefreshToken(authCode)){
        console.log('is refresh token')
        return Promise.all([
            validate.generateToken(authCode),
            validate.generateRefreshToken(authCode)
        ])
    }*/
    console.log('not refresh token')
    return Promise.all([validate.generateToken(authCode)])
}

/**
 * Recebe um objeto de cliente e um segredo de cliente e caso
 * o cliente seja válido devolve-o.
 */
validate.client = (client, clientSecret) => {
    console.log('validate client' + client + clientSecret)
    validate.clientExists(client)
    if(client.clientSecret !== clientSecret){
        validate.logAndThrow('Client secret does not match')
    }
    console.log('pre .client return')
    return client
}

/**
 * Verifica se um objeto de cliente não é nulo
 */
validate.clientExists = (client) => {
    if(client == null){
        validate.logAndThrow('Client does not exist')
    }
    return client
}

/**
 * Recebe dois tokens e verifica se são válidos. Retorna o 
 * cliente associado ao token.
 */
validate.token = (token, accessToken) => {
    utils.verifyToken(accessToken)
    console.log('VALIDATE TOKEN')
    console.log(token)
    console.log(accessToken)
    if(token.clientID !== null){
        return Client.findClientById(token.clientID)
        .then(client => validate.clientExists(client))
        .then(client => client)
    }
}

module.exports = validate