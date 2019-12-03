const fs = require('fs');
const mysql_query = require('../mysql_query');
const jimp = require('jimp');
const crypto = require('crypto');

// Return the last <count> images' thumbnails with <offset>.
// Initial query would be with offset = 0.
exports.frontpage = (req, res, next) => {
    const limit = parseInt(req.params.count, 10);
    const offset = parseInt(req.params.offset, 10);
    mysql_query("SELECT ID, Image FROM images ORDER BY Upload_Time DESC LIMIT ? OFFSET ?", [limit, offset], (err, result, fields) => {
        if(err) {
            console.log(err);
            throw err;
        }
        var response = [];
        result.forEach(element => {
            var imageData = fs.readFileSync('./image_upload/' + "thumbnail_" + element.Image);
            // Split file name to get the file's suffix (e.g. jpg or png).
            var splitFileName = element.Image.split(".");
            response.push(element.ID + ":" + splitFileName[1] + ":" + base64_encode(imageData))
        });
        res.status(200).send(response);
    });
};

// Returns an image by ID.
exports.oneImage = (req, res, next) => {
    const imageId = parseInt(req.params.imageId, 10);
    mysql_query("SELECT Image FROM images WHERE ID = ?", imageId, (err, result, fields) => {
        if(err) {
            console.log(err);
            throw err;
        }
        var imageData = fs.readFileSync('./image_upload/' + result[0].Image);
        // Split file name to get the file's suffix (e.g. jpg or png).
        var splitFileName = result[0].Image.split(".");
        return res.status(200).send(splitFileName[1] + ":" + base64_encode(imageData));
    });
};

exports.upload = (req, res, next) => {
    // Split file name to get the file's suffix (e.g. jpg or png).
    var splitFileName = req.files.file.name.split(".");
    // Image's name is a random string concatenated with the file ending.
    var imageName = crypto.randomBytes(16).toString('hex') + "." + splitFileName[splitFileName.length - 1];
    fs.writeFile('./image_upload/' + imageName, req.files.file.data, (err) => {
        if(err) {
            console.log(err);
            throw err;
        }
        const timestamp = Date.now();
        mysql_query('INSERT INTO images (Image, Upload_Time, Uploader) VALUES (?, ?, ?)', [imageName, timestamp, 1], (err, result, fields) => {
            if(err) {
                console.log(err);
            }
            jimp.read('./image_upload/' + imageName, (err, img) => {
                if(err) throw err;
                img
                    .scale(0.5)
                    .write('./image_upload/' + "thumbnail_" + imageName);
                return res.status(200).send('File upload was successful.');
            });
        });
    });
};

// Should return all images, that contain at least of the provided tags.
exports.searchForTags = (req, res, next) => {
    const limit = parseInt(req.params.count, 10);
    const offset = parseInt(req.params.offset, 10);
    const tag = req.params.tag;
    mysql_query('SELECT ID, Image FROM images WHERE Tags LIKE \'%' + req.params.tag + '%\' ORDER BY Upload_Time DESC LIMIT ? OFFSET ?', [limit, offset], (err, result, fields) => {
        if(err) {
            console.log(err);
            throw err;
        }
        var response = [];
        result.forEach(element => {
            var imageData = fs.readFileSync('./image_upload/' + "thumbnail_" + element.Image);
            // Split file name to get the file's suffix (e.g. jpg or png).
            var splitFileName = element.Image.split(".");
            response.push(element.ID + ":" + splitFileName[1] + ":" + base64_encode(imageData))
        });
        res.status(200).send(response);
    });
};

exports.rateImage = (req, res, next) => {
    const imageId = parseInt(req.params.imageId);
    const ratingValue = parseInt(req.body.ratingValue);
    mysql_query('SELECT ID FROM images WHERE ID = ?', [imageId], (err1, result1, fields1) => {
        if(err1) throw err1;
        if(result1.length === 0) {
            return res.status(404).send("Image does not exist.");
        }
        mysql_query('SELECT Image_ID FROM images_ratings WHERE Image_ID = ? AND User_ID = ?', [imageId, req.id], (err2, result2, fields2) => {
            if(err2) throw err2;
            if(result2.length !== 0) {
                return res.status(403).send("Already voted this image.");
            }
            mysql_query('INSERT INTO images_ratings (Image_ID, User_ID, Rating_Value) VALUES (?, ?, ?)', [imageId, req.id, ratingValue], (err3, result3, fields3) => {
                if(err3) throw err3;
                return res.status(200).send("Upvote successful.");
            });
        });
    });
};

// function to encode file data to base64 encoded string
function base64_encode(data) {
    return Buffer.from(data).toString('base64');
}