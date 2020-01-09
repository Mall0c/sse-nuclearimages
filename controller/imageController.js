const fs = require('fs');
const mysql_query = require('../mysql_query');
const jimp = require('jimp');
const crypto = require('crypto');
const logger = require('../logger');
const atob = require('atob');

// Return the last <count> images' thumbnails with <offset>.
// Initial query would be with offset = 0.
exports.frontpage = (req, res, next) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    const limit = parseInt(req.params.count, 10);
    const offset = parseInt(req.params.offset, 10);
    mysql_query("SELECT ID, Image FROM images WHERE (? = 1 AND Deleted = 0) OR Private = 0 AND Deleted = 0 ORDER BY Upload_Time DESC LIMIT ? OFFSET ?", [req.isAdmin, limit, offset], (err, result, fields) => {
        if(err) {
            return res.status(500).send("Something went wrong.");
        }
        var response = [];
        var isThereAnError = false;
        try {
            result.forEach(element => {
                var imageData = fs.readFileSync('./image_upload/' + "thumbnail_" + element.Image);

                // Split file name to get the file's suffix (e.g. jpg or png).
                var splitFileName = element.Image.split(".");
                response.push(element.ID + ":" + splitFileName[1] + ":" + base64_encode(imageData))
            });
        } catch(error) {
            isThereAnError = true;
        }
        if(isThereAnError) {
            logger.info({level: 'info', message: 'Image file does not exist. ImageController.Frontpage.1'});
            return res.status(500).send("Something went wrong.");
        }
        return res.status(200).send(response);
    });
};

// Returns an image by ID.
exports.oneImage = (req, res, next) => {
    const imageId = parseInt(req.params.imageId, 10);
    mysql_query("SELECT COALESCE(SUM(Rating_Value),0) as Rating, Private, Anonymous, Image, user.Username\
    FROM images\
    LEFT JOIN images_ratings ON images.ID = images_ratings.Image_ID\
    INNER JOIN user ON Uploader = user.ID\
    WHERE images.Deleted = 0 AND images.ID = ?\
    GROUP BY images.ID", [imageId], (err, result, fields) => {
        if(err) {
            return res.status(500).send("Something went wrong.");
        }

        if(result === undefined || result.length === 0) {
            return res.status(404).send("Image does not exist.");
        }

        // Image is set to private, meaning it will only be delivered if the owner queries it.
        if(req.isAdmin === 0 && result[0].Private === 1 && (req.username === undefined || result[0].Username !== req.username)) {
            return res.status(403).send("No authorization.");
        }

        if(req.isAdmin === 0 && result[0].Anonymous === 1) {
            result[0].Username = undefined;
        }
        try {
            var imageData = fs.readFileSync('./image_upload/' + result[0].Image);
        } catch(e) {
            logger.info({level: 'info', message: 'Image file does not exist. ImageController.OneImage.1'});
            return res.status(500).send("Something went wrong");
        }
        // Split file name to get the file's suffix (e.g. jpg or png).
        var splitFileName = result[0].Image.split(".");
        const username = (req.isAdmin === 0 ? result[0].Username : "(anon)"+result[0].Username);
        return res.status(200).send(username + ":" + result[0].Rating + ":" + splitFileName[1] + ":" + base64_encode(imageData));
    });
};

exports.imagesOfOneUser = (req, res, next) => {
    const limit = parseInt(req.params.count, 10);
    const offset = parseInt(req.params.offset, 10);
    if(req.id === undefined) {
        return res.status(403).send("Not logged in");
    }
    mysql_query("SELECT ID, Image FROM images WHERE Deleted = 0 AND Uploader = ? ORDER BY Upload_Time DESC LIMIT ? OFFSET ?", [req.id, limit, offset], (err, result, fields) => {
        if(err) {
            return res.status(500).send("Something went wrong.");
        }
        var response = [];
        var isThereAnError = false;
        try {
            result.forEach(element => {
                var imageData = fs.readFileSync('./image_upload/' + "thumbnail_" + element.Image);
                // Split file name to get the file's suffix (e.g. jpg or png).
                var splitFileName = element.Image.split(".");
                response.push(element.ID + ":" + splitFileName[1] + ":" + base64_encode(imageData))
            });
        } catch(error) {
            isThereAnError = true;
        }
        if(isThereAnError) {
            logger.info({level: 'info', message: 'Image file does not exist. ImageController.ImagesOfOneUser.1'});
            return res.status(500).send("Something went wrong.");
        }
        return res.status(200).send(response);
    });
};

exports.upload =  (req, res, next) => {
    if(req.id === undefined) {
        return res.status(403).send("Not logged in.");
    }
    const timestamp = Date.now();
    mysql_query('SELECT ID FROM images WHERE Uploader = ? AND Upload_Time + 5000 > ?', [req.id, timestamp], async (err0, result0, fields0) => {
        if(err0) {
            return res.status(500).send("Something went wrong.");
        }
        if(result0.length !== 0) {
            return res.status(400).send("Too many uploads.")
        }
        // Check if image is supposed to be private
        const private = parseInt(req.body.private);
        const anonymous = parseInt(req.body.anonymous);
        // Split file name to get the file's suffix (e.g. jpg or png).
        const splitFileName = req.files.file.name.split(".");
        const fileEnding = splitFileName[splitFileName.length - 1];
        if(splitFileName.length <= 1) {
            logger.info({level: 'info', message: 'File has no extension. ImageController.Upload.2'});
            return res.status(400).send("File has no extension.");
        }
        // Check for valid image.
        if(!(fileEnding === 'png' || fileEnding === 'jpg' || fileEnding === 'jpeg')) {
            logger.info({level: 'info', message: 'Invalid file format. ImageController.Upload.1'});
            return res.status(400).send("Invalid file format.");
        }
        const b64 = base64_encode(req.files.file.data);
        const buf = Buffer.from(b64, 'base64');
        var isImage = true;
        await jimp.read(buf)
        .then((img) => {
            const mimeType = img.getMIME();
            if(img.bitmap.width < 150 || img.bitmap.height < 150 || mimeType !== "image/png" && mimeType !== "image/jpeg") {
                isImage = false;
            }
        }).catch((err) => {
            isImage = false;
        });
        if(!isImage) {
            return res.status(400).send("File is not an image");
        }
        // Image's name is a random string concatenated with the file ending.
        const imageName = crypto.randomBytes(16).toString('hex') + "." + fileEnding;
        // Check if tags have been provided
        var tags = "";
        if(req.body.tags !== undefined) {
            tags = req.body.tags.toLowerCase();
        }
        fs.writeFile('./image_upload/' + imageName, req.files.file.data, (err) => {
            if(err) {
                return res.status(500).send("Something went wrong.");
            }
            mysql_query('INSERT INTO images (Image, Upload_Time, Uploader, Tags, Private, Anonymous, Deleted) VALUES (?, ?, ?, ?, ? ,?, ?)',
            [imageName, timestamp, req.id, tags, private, anonymous, 0], (err1, result, fields) => {
                if(err1) {
                    return res.status(500).send("Something went wrong.");
                }
                jimp.read('./image_upload/' + imageName, (err2, img) => {
                    if(err2) {
                        return res.status(500).send("Something went wrong.");
                    }
                    img
                        .scale(0.5)
                        .write('./image_upload/' + "thumbnail_" + imageName);
                    return res.status(200).send('File upload was successful.');
                });
            });
        });
    });
};

// Should return all images, that contain at least of the provided tags.
exports.searchForTags = (req, res, next) => {
    const limit = parseInt(req.params.count, 10);
    const offset = parseInt(req.params.offset, 10);
    const tag = atob(req.params.tag);
    if(tag.length > 100) {
        logger.info({level: 'info', message: 'Tag is too long. ImageController.Frontpage.1'});
        return res.status(400).send("Bad request.");
    }
    mysql_query('SELECT ID, Image FROM images WHERE Tags LIKE \'%' + tag + '%\' AND Deleted = 0 ORDER BY Upload_Time DESC LIMIT ? OFFSET ?', [limit, offset], (err, result, fields) => {
        if(err) {
            return res.status(500).send("Something went wrong.");
        }
        var response = [];
        var isThereAnError = false;
        try {
            result.forEach(element => {
                var imageData = fs.readFileSync('./image_upload/' + "thumbnail_" + element.Image);
                // Split file name to get the file's suffix (e.g. jpg or png).
                var splitFileName = element.Image.split(".");
                response.push(element.ID + ":" + splitFileName[1] + ":" + base64_encode(imageData))
            });
        } catch(error) {
            isThereAnError = true;
        }
        if(isThereAnError) {
            logger.info({level: 'info', message: 'Image file does not exist. ImageController.Frontpage.2'});
            return res.status(500).send("Something went wrong.");
        }
        return res.status(200).send(response);
    });
};

exports.rateImage = (req, res, next) => {
    const imageId = parseInt(req.params.imageId);
    const ratingValue = parseInt(req.body.ratingValue);
    if(!(ratingValue === 1 || ratingValue === -1)) {
        logger.info({level: 'info', message: 'Invalid rating value. ImageController.RateImage.1'});
        return res.status(400).send("Bad request.");
    }
    mysql_query('SELECT ID FROM images WHERE ID = ? AND Deleted = 0', [imageId], (err1, result1, fields1) => {
        if(err1) {
            return res.status(500).send("Something went wrong.");
        }
        if(req.username === undefined) {
            return res.status(401).send("Not logged in.");
        }
        if(result1.length === 0) {
            return res.status(404).send("Image does not exist.");
        }
        mysql_query('SELECT Image_ID FROM images_ratings WHERE Image_ID = ? AND User_ID = ?', [imageId, req.id], (err2, result2, fields2) => {
            if(err2) {
                return res.status(500).send("Something went wrong.");
            }
            if(result2.length !== 0) {
                return res.status(403).send("Already voted this image.");
            }
            mysql_query('INSERT INTO images_ratings (Image_ID, User_ID, Rating_Value) VALUES (?, ?, ?)', [imageId, req.id, ratingValue], (err3, result3, fields3) => {
                if(err3) {
                    return res.status(500).send("Something went wrong.");
                }
                return res.status(200).send("Upvote successful.");
            });
        });
    });
};

exports.deleteImage = (req, res, next) => {
    const imageId = parseInt(req.params.imageId);
    if(req.username === undefined) {
        return res.status(401).send("Not logged in.");
    }
    mysql_query('SELECT Uploader FROM images WHERE ID = ? AND Deleted = 0', [imageId], (err1, result1, fields1) => {
        if(err1) {
            return res.status(500).send("Something went wrong.");
        }
        if(result1.length === 0) {
            return res.status(404).send("Image does not exist.");
        }
        if(result1[0].Uploader !== req.id && req.isAdmin === 0) {
            return res.status(403).send("No authorization.");
        }
        mysql_query('UPDATE images SET Deleted = 1 WHERE ID = ?', [imageId], (err2, result2, fields2) => {
            if(err2) {
                return res.status(500).send("Something went wrong.");
            }
            return res.status(200).send("Image has been deleted.");
        });
    });
};

exports.reportImage = (req, res, next) => {
    const imageId = parseInt(req.params.imageId);
    const text = req.body.text;
    if(req.username === undefined) {
        return res.status(401).send("Not logged in.");
    }
    mysql_query('SELECT * FROM images_reports WHERE UserID = ? AND ImageID = ?', [req.id, imageId], (err1, result1, fields1) => {
        if(err1) {
            return res.status(500).send("Something went wrong.");
        }
        if(result1.length !== 0) {
            return res.status(400).send("You have already reported this image.");
        }
        mysql_query('INSERT INTO images_reports (UserID, ImageID, Text) VALUES (?, ?, ?)', [req.id, imageId, text], (err2, result2, fields2) => {
            if(err2) {
                return res.status(500).send("Something went wrong.");
            }
            return res.status(200).send("Image has been reported.")
        });
    });
};

// function to encode file data to base64 encoded string
function base64_encode(data) {
    return Buffer.from(data).toString('base64');
};