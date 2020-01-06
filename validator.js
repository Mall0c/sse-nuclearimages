const { check, validationResult } = require('express-validator');
const logger = require('./logger');

exports.userControllerLoginRules = () => {
    return [
        check('username').exists().isAlphanumeric(),
        check('password').exists()
    ]
}

exports.userControllerRegisterRules = () => {
    return [
        check('username').exists().isAlphanumeric(),
        check('email').isEmail().normalizeEmail().matches(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'g').withMessage("email"),
        check('password').isLength({ min: 8 })
    ]
}

exports.defaultValidation = (req, res, next) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = []
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));
    logger.info({level: 'info', message: req.method + req.originalUrl + "::" + JSON.stringify(extractedErrors)});
    return res.status(400).send("Bad request.");
}