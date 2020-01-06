const express = require('express');
const router = express.Router();
const verifyToken = require('./verifyToken');
const userController = require('./controller/userController');
const imageController = require('./controller/imageController');
const commentController = require('./controller/commentController');
const validator = require('./validator');

// Frontpage laden.
router.get('/frontpage/:count/:offset', verifyToken, imageController.frontpage);

// Ein Bild mit Informationen dazu laden.
router.get('/frontpage/:imageId', verifyToken, imageController.oneImage);

// Die Bilder laden, die einem Benutzer angehören. Kann nur der Besitzer der Bilder ausführen.
router.get('/user/images/:count/:offset', verifyToken, imageController.imagesOfOneUser);

// Ein Bild bewerten.
router.put('/voteImage/:imageId', verifyToken, imageController.rateImage);

// Ein Bild hochladen.
router.post('/upload', verifyToken, imageController.upload);

// Ein Bild löschen.
router.delete('/image/:imageId', verifyToken, imageController.deleteImage);

// Einloggen.
router.post('/login', verifyToken, validator.userControllerLoginRules(), validator.defaultValidation, userController.login);

// Registrieren.
router.post('/register', verifyToken, validator.userControllerRegisterRules(), validator.defaultValidation, userController.register);

// Benutzerdaten ändern.
router.put('/user', verifyToken, validator.userControllerChangeDataRules(), validator.defaultValidation, userController.changeData);

// Einen User löschen.
router.delete('/user', verifyToken, userController.deleteUser);

// Kommentare zu einem Bild bekommen.
router.get('/comments/:imageId', verifyToken, validator.commentControllerAllComments(), validator.defaultValidation, commentController.allComments);

// Kommentar zu einem Bild schreiben.
router.post('/comments/:imageId', verifyToken, validator.commentControllerWriteComment(), validator.defaultValidation, commentController.writeComment);

// Kommentar bearbeiten.
router.put('/comments/:commentId', verifyToken, validator.commentControllerEditComment(), validator.defaultValidation, commentController.editComment);

// Kommentar löschen.
router.delete('/comments/:commentId', verifyToken, validator.commentControllerDeleteComment(), validator.defaultValidation, commentController.deleteComment);

// Kommentar bewerten.
router.put('/voteComment/:commentId', verifyToken, validator.commentControllerRateComment(), validator.defaultValidation, commentController.rateComment);

// Bilder nach einem Tag suchen.
router.get('/search/:count/:offset/:tag', verifyToken, imageController.searchForTags);

// Bild melden.
router.put('/image/report/:imageId', verifyToken, imageController.reportImage);

// Kommentar melden.
router.put('/comment/report/:commentId', verifyToken, commentController.reportComment);

module.exports = router;