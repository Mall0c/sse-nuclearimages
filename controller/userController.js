
const mysql_query = require('../mysql_query');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dbConfig = require('../dbConfig');

exports.login = (req, res, next) => {
    const username = req.body.username;
    const plainTextPassword = req.body.password;
    mysql_query('SELECT password FROM user WHERE username = ?', username, (err, result, fields) => {
        const hashedPassword = result[0].password;
        bcrypt
        .compare(plainTextPassword, hashedPassword)
        .then(result => {
            if(result) {
                var token = jwt.sign({ username: username }, dbConfig.secret, {
                    expiresIn: 86400*31 // expires in 31 days
                });
                return res.status(200).send({ auth: true, token: token });
            } else {
                return res.status(403).send({ auth: false, token: null });
            }
        });
    });
}

// Why bcrypt: https://auth0.com/blog/hashing-in-action-understanding-bcrypt/
// Unter anderem: random salt durch library, der kryptographisch sicher ist.
exports.register = (req, res, next) => {
    const username = req.body.username;
    const plainTextPassword = req.body.password;
    bcrypt
        .genSalt(10)
        .then(salt => { return bcrypt.hash(plainTextPassword, salt); })
        .then(hash => { mysql_query('INSERT INTO user (username, password, email) VALUES (?, ?, ?)', [username, hash]) })
        .catch(err => console.error(err.message))
    var token = jwt.sign({ username: username }, dbConfig.secret, {
        expiresIn: 86400*31 // expires in 31 days
    });
    return res.status(200).send({ auth: true, token: token });
}