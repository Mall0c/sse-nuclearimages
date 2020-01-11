const express = require("express");
const app = express();
const path = require("path");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const routes = require("./routes");
const fs = require("fs");
const https = require("https");


var httpApp = express();

httpApp.get("*", function(req, res) {
  res.redirect("https://127.0.0.1:443");
});

httpApp.listen(80, function() {
  console.log("Example app listening on port 3000!");
});


app.use(bodyParser.json({}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(fileUpload({
  limits: {
      fileSize: 2097152 // 2MB
  },
  abortOnLimit: true
}));
app.use("/", routes);

/*app.listen(3000, () =>
    console.log(`Example app listening on port 3000!`),
);*/

// bad https options for CTF
httpsOptions = {
  key: fs.readFileSync("./61240634_localhost.key"),
  cert: fs.readFileSync("./61240634_localhost.cert"),
  ciphers: [
      'TLS_RSA_WITH_NULL_MD5',
      'TLS_RSA_WITH_NULL_SHA',
      'NULL',
      'SSL_RSA_WITH_NULL_MD5',
      'TLS_AES_256_GCM_SHA384',
      'TLS_CHACHA20_POLY1305_SHA256',
      'TLS_AES_128_GCM_SHA256',
      'ECDHE-RSA-AES128-GCM-SHA256',
      'ECDHE-ECDSA-AES128-GCM-SHA256',
      'ECDHE-RSA-AES256-GCM-SHA384',
      'ECDHE-ECDSA-AES256-GCM-SHA384',
      'DHE-RSA-AES128-GCM-SHA256',
      'ECDHE-RSA-AES128-SHA256',
      'DHE-RSA-AES128-SHA256',
      'ECDHE-RSA-AES256-SHA384',
      'DHE-RSA-AES256-SHA384',
      'ECDHE-RSA-AES256-SHA256',
      'DHE-RSA-AES256-SHA256',
  ].join(':')
};

https
  .createServer(httpsOptions,
    app
  )
  .listen(443);


// close destroys the server.
exports.close = function() {
  process.exit(0);
};
