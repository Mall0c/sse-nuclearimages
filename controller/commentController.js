const mysql_query = require('../mysql_query');

exports.allComments = (req, res, next) => {
    mysql_query('SELECT comments.Text, user.Username FROM user, comments WHERE user.ID = comments.Autor AND comments.Image = ?', 
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
    mysql_query('INSERT INTO comments (Text, Autor, Image) VALUES (?, ?, ?)',
        [req.body.comment, req.id, parseInt(req.params.imageId)], (err, result, fields) => {
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
    mysql_query('SELECT Id, Autor FROM comments WHERE Id = ?', [commentId], (err1, result1, fields1) => {
        if(err1) throw err1;
        if(result1.length === 0) {
            return res.status(404).send("Comment does not exist.");
        }
        if(result1[0].Autor !== req.id) {
            return res.status(403).send("No permission to edit comment.");
        }

        mysql_query('UPDATE comments SET Text = ? WHERE Id = ?', [req.body.text, commentId], (err2, result2, fields2) => {
            if(err2) throw err2;
            return res.status(200).send("Changed text");
        });
    });
};

exports.deleteComment = (req, res, next) => {
    const commentId = parseInt(req.params.commentId)
    mysql_query('SELECT ID, Autor FROM comments WHERE ID = ?', [commentId], (err1, result1, fields1) => {
        if(err1) throw err1;
        if(result1.length === 0) {
            return res.status(404).send("Comment does not exist.");
        }
        if(result1[0].Autor !== req.id) {
            return res.status(403).send("No permission to delete comment.");
        }

        mysql_query('DELETE FROM comments WHERE ID = ?', [commentId], (err2, result2, fields2) => {
            if(err2) throw err2;
            return res.status(200).send("Comment deleted.");
        });
    });
};

exports.rateComment = (req, res, next) => {
    const commentId = parseInt(req.params.commentId);
    const ratingValue = parseInt(req.body.ratingValue);
    mysql_query('SELECT ID FROM comments WHERE ID = ?', [commentId], (err1, result1, fields1) => {
        if(err1) throw err1;
        if(result1.length === 0) {
            return res.status(404).send("Comment does not exist.");
        }
        mysql_query('SELECT Comment_ID FROM comments_ratings WHERE Comment_ID = ? AND User_ID = ?', [commentId, req.id], (err2, result2, fields2) => {
            if(err2) throw err2;
            if(result2.length !== 0) {
                return res.status(403).send("Already voted this comment.");
            }
            mysql_query('INSERT INTO comments_ratings (Comment_ID, User_ID, Rating_Value) VALUES (?, ?, ?)', [commentId, req.id, ratingValue], (err3, result3, fields3) => {
                if(err3) throw err3;
                return res.status(200).send("Upvote successful.");
            });
        });
    });
};