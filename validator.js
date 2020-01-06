const { check, validationResult } = require('express-validator');
const logger = require('./logger');

exports.userControllerRegisterRules = () => {
    return [
        check('username').exists(),
        check('email').isEmail(),
        check('password').isLength({ min: 5 })
    ]
}

exports.userControllerRegisterValidation = (req, res, next) => {
    const errors = validationResult(req)
    
    if (errors.isEmpty()) {
        return next()
    }
    const extractedErrors = []
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }))
    logger.info({level: 'info', message: '100::' + JSON.stringify(extractedErrors)});
  
    return res.status(400).send("Bad request.");
}