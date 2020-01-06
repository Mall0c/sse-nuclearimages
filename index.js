const express = require('express');
const app = express();
const path = require('path');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const routes = require('./routes');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(fileUpload());
app.use('/', routes);

app.listen(3000, () =>
    console.log(`Example app listening on port 3000!`),
);

// close destroys the server.
exports.close = function() {
	process.exit(0);
};