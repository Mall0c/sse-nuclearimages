const { check, validationResult } = require('express-validator');
const logger = require('./logger');

exports.userControllerLoginRules = () => {
    return [
        check('username').exists().isLength({min: 3, max: 15}).withMessage("Username does not fit the required length.").isAlphanumeric().withMessage("Username is not alphanumeric."),
        check('password').exists().isLength({ min: 8, max: 16}).withMessage("Password does not match required length.")
    ]
}

exports.userControllerRegisterRules = () => {
    return [
        check('username').exists().isLength({min: 3, max: 15}).withMessage("Username does not fit the required length.").isAlphanumeric().withMessage("Username is not alphanumeric."),
        check('email').isEmail().normalizeEmail().isLength({ max: 254 }).withMessage("E-Mail is too long.").matches(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'g').withMessage("Does not match RegEx."),
        check('password').isLength({ min: 8, max: 16 }).withMessage("Password does not match required length.")
    ]
}

exports.userControllerChangeDataRules = () => {
    return [
        check('newPassword').isLength({ min: 8, max: 16 }).withMessage("Password does not match required length."),
        check('currentPassword').isLength({ min: 8, max: 16 }).withMessage("Password does not match required length.")
    ]
}

exports.commentControllerAllComments = () => {
    return [
        check('imageId').isNumeric().withMessage("ImageID is not numeric.")
    ]
}

exports.commentControllerWriteComment = () => {
    return [
        //check('comment').escape().isLength({ min: 1, max: 140 }).withMessage("Comment does not match length requirements."),
        check('imageId').isNumeric().withMessage("ImageID is not numeric.")
    ]
}

exports.commentControllerEditComment = () => {
    return [
        check('text').escape().isLength({ min: 1, max: 140 }).withMessage("Comment does not match length requirements."),
        check('commentId').isNumeric().withMessage("CommentID is not numeric.")
    ]
}

exports.commentControllerDeleteComment = () => {
    return [
        check('commentId').isNumeric().withMessage("CommentID is not numeric.")
    ]
}

exports.commentControllerRateComment = () => {
    return [
        check('commentId').isNumeric().withMessage("CommentID is not numeric."),
        check('ratingValue').isNumeric().withMessage("Rating value is not numeric.")
    ]
}

exports.commentControllerReportComment = () => {
    return [
        check('commentId').isNumeric().withMessage("CommentID is not numeric."),
        check('text').escape().isLength({ min: 1, max: 300 }).withMessage("Report does not match length requirements."),
    ]
}

exports.imageControllerFrontpage = () => {
    return [
        check('count').isInt({min: 0, max: 20}).withMessage("Count must be between 0 and 20."),
        check('offset').isInt({min: 0, max: 1000000000}).withMessage("Offset must be between 0 and 1.000.000.000")
    ]
}

exports.imageControllerOneImage = () => {
    return [
        check('imageId').isNumeric().withMessage("ImageId is not numeric."),
    ]
}

exports.imageControllerImagesOfOneUser = () => {
    return [
        check('count').isInt({min: 0, max: 20}).withMessage("Count must be between 0 and 20."),
        check('offset').isInt({min: 0, max: 1000000000}).withMessage("Offset must be between 0 and 1.000.000.000")
    ]
}

exports.imageControllerUpload = () => {
    return [
        check('private').isInt({min: 0, max: 1}).withMessage("Private is invalid."),
        check('anonymous').isInt({min: 0, max: 1}).withMessage("Anonymous is invalid."),
        check('tags').isLength({max: 100}).withMessage("Too long.").matches(/^[a-zA-Z0-9 ]+$/,"i").withMessage("Only alphanumerical tags, separated by white spaces.").optional({checkFalsy: true})
    ]
}

exports.imageControllerSearchForTags = () => {
    return [
        check('count').isInt({min: 0, max: 20}).withMessage("Count must be between 0 and 20."),
        check('offset').isInt({min: 0, max: 1000000000}).withMessage("Offset must be between 0 and 1.000.000.000"),
        check('tag').matches(/^[a-zA-Z0-9\ \%\=\']+$/,"i").withMessage("Only alphanumerical tags, separated by white spaces.")//isLength
    ]
}

exports.imageControllerRateImage = () => {
    return [
        check('imageId').isNumeric().withMessage("ImageId is not numeric."),
        check('ratingValue').isNumeric().withMessage("Rating value is not numeric.")
    ]
}

exports.imageControllerDeleteImage = () => {
    return [
        check('imageId').isNumeric().withMessage("ImageId is not numeric.")
    ]
}

exports.imageControllerReportImage = () => {
    return [
        check('imageId').isNumeric().withMessage("ImageId is not numeric."),
        check('text').escape().isLength({ min: 1, max: 300 }).withMessage("Report does not match length requirements.")
    ]
}

exports.defaultValidation = (req, res, next) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = []
    const userId = req.id === undefined ? "undefined" : req.id;
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));
    logger.info({user: userId, level: 'info', message: req.method + req.originalUrl + "::" + JSON.stringify(extractedErrors)});
    return res.status(400).send("Bad request.");
}