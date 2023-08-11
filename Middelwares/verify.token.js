const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const token = req.header('Authorization')
    console.log(token);

    if(!token){
        return res.status(401).send({
            errorType: 'Token non presente',
            statusCode: 401,
            message:
               "Necessaria autorizzazione per accedere"
        })
    }
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        console.log(verified);
        next();
    } catch (error) {
        res.status(403).send({
            errorType: "Token error",
            statusCode: 403,
            message:
               "Autorizzazione fornita non valida o scaduta",
            error
               
        })
    }

}