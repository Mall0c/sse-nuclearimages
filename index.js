const express = require("express");
const app = express();
const path = require("path");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const routes = require("./routes");
const fs = require("fs");
const https = require("https");

/*
var httpApp = express();

httpApp.get("*", function(req, res) {
  res.redirect("https://127.0.0.1:88");
});

httpApp.listen(3000, function() {
  console.log("Example app listening on port 3000!");
});
*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(fileUpload());
app.use("/", routes);

app.listen(3000, () =>
    console.log(`Example app listening on port 3000!`),
);

/*
https
  .createServer(
    {
      key: fs.readFileSync("./61240634_localhost.key"),
      cert: fs.readFileSync("./61240634_localhost.cert"),
      passphrase: '35egaeg0ß312ghGE?J)§)=?RT§!"JT3ß)Jß39qogj§Qg3qgßjq3'
    },
    app
  )
  .listen(88);
*/

// close destroys the server.
exports.close = function() {
  process.exit(0);
};
