const mysql_query = require('../mysql_query');

exports.allComments = (req, res, next) => {
    mysql_query('SELECT comments.text, comments.bewertung, user.username FROM user, comments WHERE user.id = comments.autor AND comments.image = ? ORDER BY comments.bewertung DESC', 
        [req.params.imageId], (err, result, fields) => {
            if(err) {
                console.log(err);
                throw err;
            }
            return res.status(200).send(result);
        });
};

exports.writeComment = (req, res, next) => {
    if(req.username === undefined) {
        return res.status(403).send("Not logged in");
    }
    mysql_query('INSERT INTO comments (text, bewertung, autor, image) VALUES (?, ?, ?, ?)',
        [req.body.comment, 0, req.id, parseInt(req.params.imageId)], (err, result, fields) => {
            if(err) {
                console.log(err);
                throw err;
            }
            return res.status(200).send();
        })
    return res.send("xd");
};