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

exports.editComment = (req, res, next) => {
    const commentId = parseInt(req.params.commentId)
    mysql_query('SELECT id, autor FROM comments WHERE id = ?', [commentId], (err1, result1, fields1) => {
        if(err1) throw err1;
        if(result1.length === 0) {
            return res.status(404).send("Comment does not exist.");
        }
        if(result1[0].autor !== req.id) {
            return res.status(403).send("No permission to edit comment.");
        }

        mysql_query('UPDATE comments SET text = ? WHERE id = ?', [req.body.text, commentId], (err2, result2, fields2) => {
            if(err2) throw err2;
            return res.status(200).send("Changed text");
        });
    })
}