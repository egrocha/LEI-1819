const fs = require('fs')
const path = require('path')
const uuid = require('uuid/v4')
const jwt = require('jsonwebtoken')

const privateKey = fs.readFileSync(path.join(__dirname, '../certs/privatekey.pem'))
const publicKey = fs.readFileSync(path.join(__dirname, '../certs/certificate.pem'))

/**
 * Cria um JSON Web Token com a chave privada
 */
exports.createToken = ({exp = 3600, sub = ''} = {}) => {
    const token = jwt.sign({
        jti: uuid(),
        sub,
        exp: Math.floor(Date.now() / 1000) + exp,
    }, privateKey, {
        algorithm: 'RS256'
    })
    return token
}

/**
 * Verifica o token através da biblioteca JWT com a chave pública
 */
exports.verifyToken = token => jwt.verify(token, publicKey)