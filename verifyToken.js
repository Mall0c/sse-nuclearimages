const jwt = require('jsonwebtoken');
const dbConfig = require('./dbConfig');
function verifyToken(req, res, next) {
    // Express headers are auto converted to lowercase.
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    
    // No token provided, not logged in.
    if (typeof token == 'undefined') {
        return res.status(200).send({ auth: false, message: 'No token provided.' });
    }
    
    // Remove Bearer from string.
    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }
    
    jwt.verify(token, dbConfig.secret, function(err, decoded) {
        if (err)
            return res.status(403).send({ auth: false, message: 'Failed to authenticate token.' });
        // if everything good, save to request for use in other routes.
        req.username = decoded.username;
        next();
    });
}
module.exports = verifyToken;