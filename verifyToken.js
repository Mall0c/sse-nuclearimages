const jwt = require('jsonwebtoken');
const dbConfig = require('./dbConfig');
const mysql_query = require('./mysql_query');

function verifyToken(req, res, next) {
    // Express headers are auto converted to lowercase.
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    // Token provided. Check for correctness.
    if (token != null) {        
        // Remove Bearer from string.
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length);
        }

        jwt.verify(token, dbConfig.secret, function(err, decoded) {
            if (err)
                return res.status(403).send({ auth: false, message: 'Failed to authenticate token.' });
            // If everything good, save to request for use in other routes.
            req.username = decoded.username;
            mysql_query('SELECT id FROM user WHERE username = ?', [req.username], (err, result, fields) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
                req.id = result[0].id;
                next();
            });
        });
    } else {
        // No token provided. Do nothing.
        console.log("token missing");
        next();
    }
}

module.exports = verifyToken;