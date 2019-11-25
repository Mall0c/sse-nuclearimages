const jwt = require('jsonwebtoken');
const dbConfig = require('./dbConfig');
function verifyToken(req, res, next) {
    // Express headers are auto converted to lowercase
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    /*
    if (typeof token == 'undefined') {
        return res.status(400).send({ auth: false, message: 'No token provided.' });
    }
    */
    if (token.startsWith('Bearer ')) {
        // Remove Bearer from string
        token = token.slice(7, token.length);
    }
    jwt.verify(token, dbConfig.secret, function(err, decoded) {
        if (err)
            return res.status(403).send({ auth: false, message: 'Failed to authenticate token.' });
        // if everything good, save to request for use in other routes
        req.userId = decoded.id;
        next();
    });
}
module.exports = verifyToken;