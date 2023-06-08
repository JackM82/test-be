import jwt from 'jsonwebtoken'

module.exports = function (req, res, next) {
    const token = req.header('auth')

    if (!token ){
        return res.status(401).send({
            errorType: 'missing Token',
            statusCode: 401,
            message: 'per accedere è necessario un token di accesso'
        })
    }

    try{
        const verified = jwt.verify(token, process.env.SECRET_JWT_KEY)
        req.user = verified

        next()
    } catch(error) {
        res.status(403).send({
            errorType: 'Token Error',
            statusCode: 403,
            message: 'Il token della tua sessione non è valido o è scaduto'
        })
    }
}
