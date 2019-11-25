var express = require('express');
const app = express();
const path=require('path');
var fs = require('fs');

app.use(express.static(path.join(__dirname, "public")));

app.get('/', (req, res) => {
    var paths = ['image_upload/a.jpg','image_upload/b.jpg','image_upload/c.jpg'];              
    res.render('gallery', { imgs: paths, layout:false});
});

app.get('/:userId', (req, res) => {
    var test = req.params.userId;
    return res.send('Received a GET HTTP method with argument ' + test);
});

app.post('/', (req, res) => {
    return res.send('Received a POST HTTP method');
});

app.put('/', (req, res) => {
    return res.send('Received a PUT HTTP method');
});

app.delete('/', (req, res) => {
    return res.send('Received a DELETE HTTP method');
});

app.listen(3000, () =>
    console.log(`Example app listening on port 3000!`),
);