const mysql_query = require('../mysql_query');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dbConfig = require('../dbConfig');
const validator = require('email-validator');
const logger = require('../logger');

exports.login = (req, res, next) => {
    const username = req.body.username;
    const plainTextPassword = req.body.password;
    if(username === undefined || plainTextPassword === undefined) {
        logger.info({level: 'info', message: 'Insufficient arguments. UserController.Login.1'});
        return res.status(400).send("Insufficient arguments.");
    }
    mysql_query('SELECT Password FROM user WHERE Username = ? AND Deleted = 0', [username], (err, result, fields) => {
        if(err) {
            logger.info({level: 'info', message: 'UserController.Login.2'});
            return res.status(500).send("Something went wrong.");
        }
        if(result.length === 0) {
            logger.info({level: 'info', message: 'Username does not exist. UserController.Login.3'});
            return res.status(404).send("Username does not exist.");
        }
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
    if(username === undefined || plainTextPassword === undefined || email === undefined) {
        logger.info({level: 'info', message: 'Insufficient arguments. UserController.Register.1'});
        return res.status(400).send("Insufficient arguments.");
    }
    const isValidEMail = validator.validate(email);
    if(!isValidEMail) {
        logger.info({level: 'info', message: 'Invalid email. UserController.Register.2'});
        return res.status(400).send("Invalid email.");
    }
    // Returns the ID of the users whom the email or the username belongs to.
    // This is done for duplicate check.
    mysql_query('SELECT ID FROM user WHERE username = ? OR email = ?', [username, email], (err1, result1, fields1) => {
        if(err1) {
            logger.info({level: 'info', message: 'UserController.Register.3'});
            return res.status(500).send("Something went wrong.");
        }
        if(result1.length > 0) {
            logger.info({level: 'info', message: 'User already exists. UserController.Register.4'});
            return res.status(400).send("User already exists.");
        }
        bcrypt
            .genSalt(10)
            .then(salt => { return bcrypt.hash(plainTextPassword, salt); })
            .then(hash => { mysql_query('INSERT INTO user (Username, Password, EMail, Deleted, IsAdmin) VALUES (?, ?, ?, 0, 0)', [username, hash, email]); })
            .catch(err => { 
                logger.info({level: 'error', message: err.stack + " UserController.Register.5" });
                return res.status(500).send("Something went wrong.");
            });
        var token = jwt.sign({ username: username }, dbConfig.secret, {
            expiresIn: 86400*31 // expires in 31 days
        });
        return res.status(200).send({ auth: true, token: token });
    });
};

exports.deleteUser = (req, res, next) => {
    if(req.username === undefined) {
        logger.info({level: 'info', message: 'Not logged in. UserController.DeleteUser.1'});
        return res.status(401).send("Not logged in.");
    }
    const userId = req.id;
    mysql_query('SELECT ID FROM user WHERE ID = ? AND Deleted = 0', [userId], (err1, result1, fields1) => {
        if(err1) {
            logger.info({level: 'info', message: 'UserController.DeleteUser.2'});
            return res.status(500).send("Something went wrong.");
        }
        if(result1.length === 0) {
            logger.info({level: 'info', message: 'User does not exist. UserController.DeleteUser.3'});
            return res.status(404).send("User does not exist.");
        }
        if(result1[0].ID !== req.id) {
            logger.info({level: 'info', message: 'No authorization. UserController.DeleteUser.4'});
            return res.status(403).send("No authorization.");
        }
        if(result1[0].Deleted === 1) {
            logger.info({level: 'info', message: 'User has already been deleted. UserController.DeleteUser.6'});
            return res.status(404).send("User does not exist.");
        }
        mysql_query('UPDATE user SET Deleted = 1 WHERE ID = ?', [userId], (err2, result2, fields2) => {
            if(err2) {
                logger.info({level: 'info', message: 'UserController.DeleteUser.5'});
                return res.status(500).send("Something went wrong.");
            }
            return res.status(200).send("User has been deleted.");
        });
    });
};

exports.changeData = (req, res, next) => {
    if(req.username === undefined) {
        logger.info({level: 'info', message: 'Not logged in. UserController.ChangeData.1'});
        return res.status(401).send("Not logged in.");
    }
    const email = req.body.email;
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;
    if(email !== undefined) {
        const isValidEMail = validator.validate(email);
        if(!isValidEMail) {
            logger.info({level: 'info', message: 'Invalid email. UserController.ChangeData.2'});
            return res.status(400).send("Invalid email.");
        }
    }
    if(email === undefined && newPassword === undefined) {
        logger.info({level: 'info', message: 'No information to change provided. UserController.ChangeData.3'});
        return res.status(400).send("No information to change provided.");
    }
    if(currentPassword === undefined) {
        logger.info({level: 'info', message: 'Old password has not been provided. UserController.ChangeData.4'});
        return res.status(400).send("Old password has not been provided.")
    }
    mysql_query('SELECT Password FROM user WHERE Username = ? AND Deleted = 0', req.username, (err1, result1, fields1) => {
        if(err1) {
            logger.info({level: 'info', message: 'UserController.ChangeData.5'});
            return res.status(500).send("Something went wrong.");
        }
        if(result1.length === 0) {
            logger.info({level: 'info', message: 'User does not exist. UserController.ChangeData.6'});
            return res.status(400).send("User does not exist");
        }
        const hashedPassword = result1[0].Password;
        bcrypt
        .compare(currentPassword, hashedPassword)
        .then(result => {
            if(result) {
                if(email !== undefined && newPassword === undefined) {
                    mysql_query('UPDATE user SET EMail = ? WHERE ID = ?', [email, req.id], (err2, result2, fields2) => {
                        if(err2) {
                            logger.info({level: 'info', message: 'UserController.ChangeData.7'});
                            return res.status(500).send("Something went wrong.");
                        }
                        return res.status(200).send("Information has been changed.")
                    });
                } else if(email === undefined && newPassword !== undefined) {
                    bcrypt.genSalt(10).then(salt => { return bcrypt.hash(newPassword, salt); }).then(hash => {
                        mysql_query('UPDATE user SET Password = ? WHERE ID = ?', [hash, req.id], (err2, result2, fields2) => {
                            if(err2) {
                                logger.info({level: 'info', message: 'UserController.ChangeData.8'});
                                return res.status(500).send("Something went wrong.");
                            }
                            return res.status(200).send("Information has been changed.")
                        });  
                    });
                } else {
                    bcrypt.genSalt(10).then(salt => { return bcrypt.hash(newPassword, salt); }).then(hash => {
                        mysql_query('UPDATE user SET Password = ?, Email = ? WHERE ID = ?', [hash, email, req.id], (err2, result2, fields2) => {
                            if(err2) {
                                logger.info({level: 'info', message: 'UserController.ChangeData.9'});
                                return res.status(500).send("Something went wrong.");
                            }
                            return res.status(200).send("Information has been changed.")
                        });  
                    });
                }
            } else {
                logger.info({level: 'info', message: 'Wrong password. UserController.ChangeData.10'});
                return res.status(403).send("Wrong password.");
            }
        });
    });
};