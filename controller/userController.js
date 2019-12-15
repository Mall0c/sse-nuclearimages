
const mysql_query = require('../mysql_query');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dbConfig = require('../dbConfig');

exports.login = (req, res, next) => {
    const username = req.body.username;
    const plainTextPassword = req.body.password;
    mysql_query('SELECT Password FROM user WHERE Username = ? AND Deleted = 0', username, (err, result, fields) => {
        const hashedPassword = result[0].Password;
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
};

// Why bcrypt: https://auth0.com/blog/hashing-in-action-understanding-bcrypt/
// Unter anderem: random salt durch library, der kryptographisch sicher ist.
exports.register = (req, res, next) => {
    const username = req.body.username;
    const plainTextPassword = req.body.password;
    const email = req.body.email;
    bcrypt
        .genSalt(10)
        .then(salt => { return bcrypt.hash(plainTextPassword, salt); })
        .then(hash => { mysql_query('INSERT INTO user (Username, Password, EMail, Deleted, IsAdmin) VALUES (?, ?, ?, 0, 0)', [username, hash, email]) })
        .catch(err => console.error(err.message))
    var token = jwt.sign({ username: username }, dbConfig.secret, {
        expiresIn: 86400*31 // expires in 31 days
    });
    return res.status(200).send({ auth: true, token: token });
};

exports.deleteUser = (req, res, next) => {
    const userId = parseInt(req.params.userId);
    if(req.username === undefined) {
        return res.status(401).send("Not logged in.");
    }
    mysql_query('SELECT ID FROM user WHERE ID = ? AND Deleted = 0', [userId], (err1, result1, fields1) => {
        if(err1) throw err1;
        if(result1.length === 0) {
            return res.status(404).send("User does not exist.");
        }
        if(result1[0].ID !== req.id) {
            return res.status(403).send("No authorization.");
        }
        mysql_query('UPDATE user SET Deleted = 1 WHERE ID = ?', [userId], (err2, result2, fields2) => {
            if(err2) throw err2;
            return res.status(200).send("User has been deleted.");
        });
    });
};

exports.changeData = (req, res, next) => {
    if(req.username === undefined) {
        return res.status(401).send("Not logged in.");
    }
    const email = req.body.email;
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;
    if(email === undefined && newPassword === undefined) {
        return res.status(400).send("No information to change provided.");
    }
    if(currentPassword === undefined) {
        return res.status(400).send("Old password has not been provided.")
    }
    mysql_query('SELECT Password FROM user WHERE Username = ? AND Deleted = 0', req.username, (err1, result1, fields1) => {
        if(err1) throw err1;
        const hashedPassword = result1[0].Password;
        bcrypt
        .compare(currentPassword, hashedPassword)
        .then(result => {
            if(result) {
                if(email !== undefined && newPassword === undefined) {
                    mysql_query('UPDATE user SET EMail = ? WHERE ID = ?', [email, req.id], (err2, result2, fields2) => {
                        if(err2) throw err2;
                        return res.status(200).send("Information has been changed.")
                    });
                } else if(email === undefined && newPassword !== undefined) {
                    bcrypt.genSalt(10).then(salt => { return bcrypt.hash(newPassword, salt); }).then(hash => {
                        mysql_query('UPDATE user SET Password = ? WHERE ID = ?', [hash, req.id], (err2, result2, fields2) => {
                            if(err2) throw err2;
                            return res.status(200).send("Information has been changed.")
                        });  
                    });
                } else {
                    bcrypt.genSalt(10).then(salt => { return bcrypt.hash(newPassword, salt); }).then(hash => {
                        mysql_query('UPDATE user SET Password = ?, Email = ? WHERE ID = ?', [hash, email, req.id], (err2, result2, fields2) => {
                            if(err2) throw err2;
                            return res.status(200).send("Information has been changed.")
                        });  
                    });
                }
            } else {
                return res.status(403).send("Wrong password.");
            }
        });
    });
};