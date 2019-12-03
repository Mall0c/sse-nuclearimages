const express = require('express');
const router = express.Router();
const verifyToken = require('./verifyToken');
const userController = require('./controller/userController');
const imageController = require('./controller/imageController');
const commentController = require('./controller/commentController');

router.get('/frontpage/:count/:offset', verifyToken, imageController.frontpage);

router.get('/frontpage/:imageId', verifyToken, imageController.oneImage);

router.put('/voteImage/:imageId', verifyToken, imageController.rateImage);

router.post('/upload', verifyToken, imageController.upload);

router.post('/login', userController.login);

router.post('/register', userController.register);

router.get('/comments/:imageId', commentController.allComments);

router.post('/comments/:imageId', verifyToken, commentController.writeComment);

router.put('/comments/:commentId', verifyToken, commentController.editComment);

router.delete('/comments/:commentId', verifyToken, commentController.deleteComment);

router.put('/voteComment/:commentId', verifyToken, commentController.rateComment);

router.get('/search/:count/:offset/:tag', imageController.searchForTags);

// TODO:
router.get('/logout');

router.delete('/user');

router.put('/user/:properties');

module.exports = router;