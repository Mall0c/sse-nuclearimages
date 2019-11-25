const express = require('express');
const app = express();
const path=require('path');
const mysql = require('mysql');
const fileUpload = require('express-fileupload');
//const verifyToken = require(verifyToken.js);
const dbConfig = require('./dbConfig');

var con = mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database
});

app.use(express.static(path.join(__dirname, "public")));
app.use(fileUpload());

// Query the last <count> images with <offset> for.
// Initial query would be with offset = 0.
app.get('/frontpage/:count/:offset', (req, res) => {
    var limit = parseInt(req.params.count, 10);
    var offset = parseInt(req.params.offset, 10);
    con.query("SELECT * FROM images ORDER BY uploadTime DESC LIMIT ? OFFSET ?", [limit, offset], (err, result, fields) => {
        if(err) {
            console.log(err);
        }
        res.send(result);
    });
});

app.post('/upload', (req, res) => {
    var imageAsBase64 = base64_encode(req.files.foo)
    var timestamp = Date.now();
    con.query('INSERT INTO images (image, uploadTime, uploader) VALUES (?, ?, ?)', [imageAsBase64, timestamp, 1], (err, result, fields) => {
        if(err) {
            console.log(err);
        }
    });
    return res.status(200).send('File upload was successful.');
});

app.listen(3000, () =>
    console.log(`Example app listening on port 3000!`),
);

// function to encode file data to base64 encoded string
function base64_encode(file) {
    return Buffer.from(file.data).toString('base64');
}