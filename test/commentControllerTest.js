const assert = require('assert');
const mysql_query_async = require('../mysql_query_async');
const app = require('../index');
const request = require('request');

describe('CommentController', () => {
	after(() => {
		setTimeout(function() { app.close(); }, 1000);
    });
    describe('Write comment', () => {
        it('should not post a comment without being logged in', async () => {
            await clearDatabaseAsync();
            // There is nothing to arrange. Act.
            request({
                url: 'http://localhost:3000/comments/33333',
                method: 'POST',
                json: {comment: 'xd'}
            }, function(error, response, body){
                if(error) throw error;
                // Assert.
                assert.equal(response.statusCode, 401);
                assert.equal(body, "Not logged in.");
            });
        });
    });
    
    describe('Edit comment', () => {
        it('should not edit a comment without being logged in', async () => {
            await clearDatabaseAsync();
            // Arrange. Create a comment.
            await mysql_query_async().query('INSERT INTO comments (ID, Autor) VALUES(44444, 2)');
            // Act.
            request({
                url: 'http://localhost:3000/comments/44444',
                method: 'PUT',
                json: {text: 'xd'}
            }, function(error, response, body){
                if(error) throw error;
                // Assert.
                assert.equal(response.statusCode, 401);
                assert.equal(body, "Not logged in.");
            });
        });

        it('should not edit a comment that does not exist', async() => {
            await clearDatabaseAsync();
            // Arrange. Create an account.
            request({
				url: 'http://localhost:3000/register',
				method: 'POST',
				json: {username: 'heydude11', password: 'username', email: 'a11@a.aa'}
			}, async function(error, response, body) {
                if(error) throw error;
                const token = body.token;
                // Act.
                request({
                    url: 'http://localhost:3000/comments/44445',
                    method: 'PUT',
                    json: {text: 'xd'},
                    headers: {
                        'x-access-token': token
                    }
                }, function(error1, response1, body1){
                    if(error1) throw error1;
                    // Assert.
                    assert.equal(response1.statusCode, 404);
                    assert.equal(body1, "Comment does not exist.");
                });
            });
        });
/*
        it('should not edit a comment when the requester is not its owner', async() => {
            await clearDatabaseAsync();
            // Arrange. Create an account.
            request({
				url: 'http://localhost:3000/register',
				method: 'POST',
				json: {username: 'heydude120', password: 'username', email: 'a120@a.aa'}
			}, async function(error1, response1, body1) {
                if(error1) throw error1;
                const token = body1.token;
                const db = mysql_query_async();
                setTimeout( async function() {
                    const userId = (await db.query('SELECT * FROM user WHERE Username = ?', ['heydude120']))[0].ID;
                    console.log(userId);
                    // Insert the comment.
                    await db.query('INSERT INTO comments (ID, Autor, Deleted) VALUES (999911,'+userId+1+',0)');
                    setTimeout(async function() {
                        request({
                            url: 'http://localhost:3000/comments/999911',
                            headers: {
                                'x-access-token': token
                            },
                            json: {text: 'xd'},
                            method: 'PUT'
                        }, function(error2, response2, body2){
                            if(error2) throw error2;
                            // Assert.
                            assert.equal(response2.statusCode, 403);
                            assert.equal(body2, "No permission to edit comment.");
                        });
                    }, 500);
                }, 500);
            });
        });*/
    });

    describe('Delete comment', () => {
        it('should not delete a comment without being logged in', async() => {
            await clearDatabaseAsync();
            // Nothing to arrange. Act.
            request({
				url: 'http://localhost:3000/comments/555555',
				method: 'DELETE'
			}, async function(error1, response1, body1) {
                if(error1) throw error1;
                assert.equal(response1.statusCode, 401);
                assert.equal(body1, "Not logged in.");
            });
        });

        it('should not delete a comment that does not exist', async() => {
            await clearDatabaseAsync();
            // Arrange. Create an account.
            request({
				url: 'http://localhost:3000/register',
				method: 'POST',
				json: {username: 'heydude13', password: 'username', email: 'a13@a.aa'}
			}, async function(error1, response1, body1) {
                if(error1) throw error1;
                const token = body1.token;
                // Act.
                request({
                    url: 'http://localhost:3000/comments/666333',
                    method: 'DELETE',
                    headers: {
                        'x-access-token': token
                    }
                }, async function(error2, response2, body2) {
                    if(error2) throw error2;
                    assert.equal(response2.statusCode, 404);
                    assert.equal(body2, "Comment does not exist.");
                });
            });
        });

        it('should not delete a comment when the requester is not its owner', async() => {
            await clearDatabaseAsync();
            // Arrange. Create an account.
            request({
				url: 'http://localhost:3000/register',
				method: 'POST',
				json: {username: 'heydude20', password: 'username', email: 'a20@a.aa'}
			}, async function(error1, response1, body1) {
                if(error1) throw error1;
                const token = body1.token;
                const db = mysql_query_async();
                const userId = (await db.query('SELECT * FROM user WHERE Username = ?', ['heydude20']))[0].ID;
                // Insert the comment.
                await db.query('INSERT INTO comments (ID, Autor, Deleted) VALUES (999910,'+userId+1+',0)');
                setTimeout(async function() {
                    // Act.
                    request({
                        url: 'http://localhost:3000/comments/999910',
                        headers: {
                            'x-access-token': token
                        },
                        json: {text: 'xd'},
                        method: 'DELETE'
                    }, function(error2, response2, body2){
                        if(error2) throw error2;
                        // Assert.
                        assert.equal(response2.statusCode, 403);
                        assert.equal(body2, "No permission to delete comment.");
                    });
                }, 100);
            });
        });
    });

    describe('Rate comment', () => {
        it('should not give a comment an invalid rating', async() => {
            await clearDatabaseAsync();
            // Arrange. Create an account.
            request({
				url: 'http://localhost:3000/register',
				method: 'POST',
				json: {username: 'heydude18', password: 'username', email: 'a18@a.aa'}
			}, async function(error, response, body) {
                if(error) throw error;
                const token = body.token;
                await mysql_query_async().query('INSERT INTO comments (ID, Deleted) VALUES (222999, 0)')
                // setTimeout is necessary because sometimes there were cases where the database has not written the new user
                // into the database yet.
                setTimeout(async function() {
                    //Act.
                    request({
                        url: 'http://localhost:3000/voteComment/222999',
                        method: 'PUT',
                        json: {ratingValue: '11'},
                        headers: {
                            'x-access-token': token
                        }
                    }, async function(error1, response1, body1) {
                        if(error1) throw error1;
                        // Assert.
                        assert.equal(response1.statusCode, 400);
                        assert.equal(body1, "Bad request.");
                    });
                }, 500);
            });
        });

    /*    it('should not rate a comment that does not exist', async() => {
            await clearDatabaseAsync();
            // Arrange. Create an account.
            request({
				url: 'http://localhost:3000/register',
				method: 'POST',
				json: {username: 'heydude30', password: 'username', email: 'a30@a.aa'}
			}, async function(error, response, body) {
                if(error) throw error;
                const token = body.token;
                // setTimeout is necessary because sometimes there were cases where the database has not written the new user
                // into the database yet.
                console.log(token);
                setTimeout(async function() {
                    //Act.
                    request({
                        url: 'http://localhost:3000/voteComment/777888',
                        method: 'PUT',                        
                        headers: {
                            'x-access-token': token
                        },
                        json: {ratingValue: '1'}
                    }, async function(error1, response1, body1) {
                        if(error1) throw error1;                        
                        // Assert.
                        assert.equal(response1.statusCode, 404);
                        assert.equal(body1, "Comment does not exist.");
                    });
                }, 1000);
            });
        });*/
        
        it('should not rate a comment withoug being logged in', async() => {
            // Nothing to arrange. Act.
            request({
                url: 'http://localhost:3000/voteComment/229922',
                method: 'PUT',
                json: {ratingValue: '1'},
            }, async function(error1, response1, body1) {
                if(error1) throw error1;
                // Assert.
                assert.equal(response1.statusCode, 401);
                assert.equal(body1, "Not logged in.");
            });
        });

        it('should not rate a comment twice from the same user', async() => {
            await clearDatabaseAsync();
            // Arrange. Create an account.
            request({
				url: 'http://localhost:3000/register',
				method: 'POST',
				json: {username: 'heydude121', password: 'username', email: 'a121@a.aa'}
			}, async function(error, response, body) {
                if(error) throw error;
                const token = body.token;
                await mysql_query_async().query('INSERT INTO comments (ID, Deleted) VALUES (76543, 0)')
                // setTimeout is necessary because sometimes there were cases where the database has not written the new user
                // into the database yet.
                setTimeout(async function() {
                    // Vote the image for the first time.
                    request({
                        url: 'http://localhost:3000/voteComment/76543',
                        method: 'PUT',
                        json: {ratingValue: '1'},
                        headers: {
                            'x-access-token': token
                        }
                    }, async function(error1, response1, body1) {
                        if(error1) throw error1;
                        // Act. Vote the image for the second time.
                        request({
                            url: 'http://localhost:3000/voteComment/76543',
                            method: 'PUT',
                            json: {ratingValue: '1'},
                            headers: {
                                'x-access-token': token
                            }
                        }, async function(error2, response2, body2) {
                            if(error2) throw error2;
                            // Assert.
                            assert.equal(response2.statusCode, 403);
                            assert.equal(body2, "Already voted this comment.");
                        });
                    });
                }, 500);
            });
        });
    });
});

const clearDatabaseAsync = async () => {
	const db = mysql_query_async();
	try {
		await db.query('DELETE FROM comments WHERE 1=1');
		await db.query('DELETE FROM comments_ratings WHERE 1=1');
		await db.query('DELETE FROM comments_reports WHERE 1=1');
		await db.query('DELETE FROM images WHERE 1=1');
		await db.query('DELETE FROM images_ratings WHERE 1=1');
		await db.query('DELETE FROM comments_reports WHERE 1=1');
		await db.query('DELETE FROM user WHERE 1=1');
	} catch(err) {
		if(err) throw err;
	} finally {
		await db.close();
	}
};