const express = require('express');
const app = express();
const path=require('path');
const mysql = require('mysql');
const fileUpload = require('express-fileupload');
const verifyToken = require('./verifyToken');
const dbConfig = require('./dbConfig');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

var con = mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(fileUpload());

// Query the last <count> images with <offset> for.
// Initial query would be with offset = 0.
app.get('/frontpage/:count/:offset', (req, res) => {
    const limit = parseInt(req.params.count, 10);
    const offset = parseInt(req.params.offset, 10);
    con.query("SELECT * FROM images ORDER BY uploadTime DESC LIMIT ? OFFSET ?", [limit, offset], (err, result, fields) => {
        if(err) {
            console.log(err);
        }
        res.send(result);
    });
});

app.post('/upload', (req, res) => {
    var imageAsBase64 = base64_encode(req.files.foo)
    const timestamp = Date.now();
    con.query('INSERT INTO images (image, uploadTime, uploader) VALUES (?, ?, ?)', [imageAsBase64, timestamp, 1], (err, result, fields) => {
        if(err) {
            console.log(err);
        }
    });
    return res.status(200).send('File upload was successful.');
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const plainTextPassword = req.body.password;
    con.query('SELECT password FROM user WHERE username = ?', username, (err, result, fields) => {
        const hashedPassword = result[0].password;
        console.log(result);
        bcrypt
        .compare(plainTextPassword, hashedPassword)
        .then(result => {
            if(result) {
                var token = jwt.sign({ username: username }, dbConfig.secret, {
                    expiresIn: 86400*31 // expires in 31 days
                });
                return res.status(200).send({ auth: true, token: token });
            } else {
                return res.status(403).send({ auth: false });
            }
        });
    });
});

// Why bcrypt: https://auth0.com/blog/hashing-in-action-understanding-bcrypt/
// Unter anderem: random salt durch library
app.post('/register', (req, res) => {
    const username = req.body.username;
    const plainTextPassword = req.body.password;
    bcrypt
    .genSalt(10)
    .then(salt => { return bcrypt.hash(plainTextPassword, salt); })
    .then(hash => { con.query('INSERT INTO user (username, password) VALUES (?, ?)', [username, hash]) })
    .catch(err => console.error(err.message))
    var token = jwt.sign({ username: username }, dbConfig.secret, {
        expiresIn: 86400*31 // expires in 31 days
    });
    return res.status(200).send({ auth: true, token: token });
});

app.listen(3000, () =>
    console.log(`Example app listening on port 3000!`),
);

// function to encode file data to base64 encoded string
function base64_encode(file) {
    return Buffer.from(file.data).toString('base64');
}