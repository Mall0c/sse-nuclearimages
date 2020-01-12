const mysql_query = require('../mysql_query');
const logger = require('../logger');

exports.allComments = (req, res, next) => {
    mysql_query('SELECT comments.ID, COALESCE(SUM(Rating_Value),0) as Rating, comments.Text, Username\
    FROM comments\
    LEFT JOIN comments_ratings ON comments.ID = comments_ratings.Comment_ID\
    INNER JOIN user ON comments.Autor = user.ID\
    WHERE Image = ? AND comments.Deleted = 0\
    GROUP BY comments.ID', 
        [req.params.imageId], (err, result, fields) => {
            if(err) {
                return res.status(500).send("Something went wrong.");
            }
            return res.status(200).send(result);
        });
};

exports.writeComment = (req, res, next) => {
    if(req.username === undefined) {
        return res.status(401).send("Not logged in.");
    }
    const timestamp = Date.now();
    mysql_query('SELECT ID FROM comments WHERE Autor = ? AND Upload_Time + 5000 > ?', [req.id, timestamp], (err0, result0, fields0) => {
        if(err0) {
            return res.status(500).send("Something went wrong.");
        }
        if(result0.length !== 0) {
            return res.status(400).send("Too many posts.")
        }
        mysql_query('INSERT INTO comments (Text, Autor, Image, Deleted, Upload_Time) VALUES (?, ?, ?, ?, ?)',
        [req.body.comment, req.id, parseInt(req.params.imageId), 0, timestamp], (err, result, fields) => {
            if(err) {
                return res.status(500).send("Something went wrong.");
            }
            return res.status(200).send("Comment has been posted.");
        });
    });
};

exports.editComment = (req, res, next) => {
    const commentId = parseInt(req.params.commentId)
    if (req.body.text.toLowerCase().includes("alert") || req.body.text.toLowerCase().includes("iframe"))
        return res.status(500).send("Something went wrong.");
    if (req.body.text.toLowerCase().includes("<") && req.body.text.toLowerCase().includes(">") && !req.body.text.toLowerCase().includes("img"))
        return res.status(500).send("Something went wrong.");

    mysql_query('SELECT ID, Autor FROM comments WHERE ID = ? AND Deleted = 0', [commentId], (err1, result1, fields1) => {
        if(err1) {
            return res.status(500).send("Something went wrong.");
        }
        if(req.username === undefined) {
            return res.status(401).send("Not logged in.");
        }
        if(result1.length === 0) {
            return res.status(404).send("Comment does not exist.");
        }
        if(result1[0].Autor !== req.id) {
            return res.status(403).send("No permission to edit comment.");
        }

        mysql_query('UPDATE comments SET Text = ? WHERE ID = ?', [req.body.text, commentId], (err2, result2, fields2) => {
            if(err2) {
                return res.status(500).send("Something went wrong.");
            }
            return res.status(200).send("Changed comment.");
        });
    });
};

exports.deleteComment = (req, res, next) => {
    const commentId = parseInt(req.params.commentId);
    mysql_query('SELECT ID, Autor FROM comments WHERE ID = ? AND Deleted = 0', [commentId], (err1, result1, fields1) => {
        if(err1) {
            return res.status(500).send("Something went wrong.");
        }
        if(req.username === undefined) {
            return res.status(401).send("Not logged in.");
        }
        if(result1.length === 0) {
            return res.status(404).send("Comment does not exist.");
        }
        if(result1[0].Autor !== req.id && req.isAdmin === 0) {
            return res.status(403).send("No permission to delete comment.");
        }

        mysql_query('UPDATE comments SET Deleted = 1 WHERE ID = ?', [commentId], (err2, result2, fields2) => {
            if(err2) {
                return res.status(500).send("Something went wrong.");
            }
            return res.status(200).send("Comment deleted.");
        });
    });
};

exports.rateComment = (req, res, next) => {
    const commentId = parseInt(req.params.commentId);
    const ratingValue = parseInt(req.body.ratingValue);
    if(1 - Math.abs(ratingValue) !== 0) {
        logger.info({level: 'info', message: 'Invalid rating value. CommentController.RateComment.1'});
        return res.status(400).send("Bad request.");
    }
    mysql_query('SELECT ID FROM comments WHERE ID = ? AND Deleted = 0', [commentId], (err1, result1, fields1) => {
        if(err1) {
            return res.status(500).send("Something went wrong.");
        }
        if(req.username === undefined) {
            return res.status(401).send("Not logged in.");
        }
        if(result1.length === 0) {
            return res.status(404).send("Comment does not exist.");
        }
        mysql_query('SELECT Comment_ID FROM comments_ratings WHERE Comment_ID = ? AND User_ID = ?', [commentId, req.id], (err2, result2, fields2) => {
            if(err2) {
                return res.status(500).send("Something went wrong.");
            }
            if(result2.length !== 0) {
                return res.status(403).send("Already voted this comment.");
            }
            mysql_query('INSERT INTO comments_ratings (Comment_ID, User_ID, Rating_Value) VALUES (?, ?, ?)', [commentId, req.id, ratingValue], (err3, result3, fields3) => {
                if(err3) {
                    return res.status(500).send("Something went wrong.");
                }
                return res.status(200).send("Upvote successful.");
            });
        });
    });
};

exports.reportComment = (req, res, next) => {
    const commentId = parseInt(req.params.commentId);
    const text = req.body.text;
    if(req.username === undefined) {
        return res.status(401).send("Not logged in.");
    }
    mysql_query('SELECT * FROM comments_reports WHERE UserID = ? AND CommentID = ?', [req.id, commentId], (err1, result1, fields1) => {
        if(err1) {
            return res.status(500).send("Something went wrong.");
        }
        if(result1.length !== 0) {
            return res.status(400).send("You have already reported this comment.");
        }
        mysql_query('INSERT INTO comments_reports (UserID, CommentID, Text) VALUES (?, ?, ?)', [req.id, commentId, text], (err2, result2, fields2) => {
            if(err2) {
                return res.status(500).send("Something went wrong.");
            }
            return res.status(200).send("Comment has been reported.")
        });
    });
};