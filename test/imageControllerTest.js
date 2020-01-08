const assert = require('assert');
const mysql_query_async = require('../mysql_query_async');
const app = require('../index');
const request = require('request');

describe('ImageController', () => {
	after(() => {
		setTimeout(function() { app.close(); }, 1000);
    });

    describe('Frontpage', () => {
        it('should not load the frontpage with more than 20 images at once', async () => {
            await clearDatabaseAsync();
            // There is nothing to arrange. Act.
            request({
                url: 'http://localhost:3000/frontpage/21/0',
                method: 'GET'
            }, function(error, response, body){
                if(error) throw error;
                // Assert.
                assert.equal(response.statusCode, 400);
                assert.equal(body, "Bad request.");
            });
        });
    });

    describe('One image', () => {
        it('should not load an image that does not exist', async () => {
            await clearDatabaseAsync();
            // There is nothing to arrange. Act.
            request({
                url: 'http://localhost:3000/frontpage/21',
                method: 'GET'
            }, function(error, response, body){
                if(error) throw error;
                // Assert.
                assert.equal(response.statusCode, 404);
                assert.equal(body, "Image does not exist.");
            });
        });

        it('should not load an image that is private and does not belong to the requester', async () => {
            await clearDatabaseAsync();
            const db = mysql_query_async();
            // Arrange. Create the uploader of the user
			request({
				url: 'http://localhost:3000/register',
				method: 'POST',
				json: {username: 'heydude1', password: 'username', email: 'a1@a.aa'}
			}, async function(error, response, body) {
                if(error) throw error;
                // setTimeout is necessary because sometimes there were cases where the database has not written the new user
                // into the database yet.
                setTimeout(async function() {
                    // Fetch the uploader's ID that is needed for the image as foreign key.
                    const userId = (await db.query('SELECT * FROM user WHERE Username = ?', ['heydude1']))[0].ID;
                    // Insert the image.
                    await db.query('INSERT INTO images (ID, Uploader, Private, Anonymous, Deleted) VALUES (999997,'+userId+', 1, 0, 0)');
                    // Register the second user.
                    request({
                        url: 'http://localhost:3000/register',
                        method: 'POST',
                        json: {username: 'heydude2', password: 'username', email: 'a2@a.aa'}
                    }, async function(error2, response2, body2) {
                        if(error2) throw error2;
                        const token = body2.token;
                        request({
                            url: 'http://localhost:3000/frontpage/999997',
                            headers: {
                                'x-access-token': token
                            },
                            method: 'GET'
                        }, function(error3, response3, body3){
                            if(error3) throw error3;
                            // Assert.
                            assert.equal(response3.statusCode, 403);
                            assert.equal(body3, "No authorization.");
                        });
                    });
            }, 100);
			});
        });
    });

    describe('Image upload', () => {
        it('should not upload an image without being logged in', async () => {
            await clearDatabaseAsync();
            // There is nothing to arrange. Act.
            request({
                url: 'http://localhost:3000/upload',
                method: 'POST',
                json: {anonymous: '0', private: '0'}
            }, function(error, response, body){
                if(error) throw error;
                // Assert.
                assert.equal(response.statusCode, 403);
                assert.equal(body, "Not logged in.");
            });
        });

        it('should not upload an image where tags contain "<" or ">"', async () => {
            await clearDatabaseAsync();
            // There is nothing to arrange. Act.
            request({
                url: 'http://localhost:3000/upload',
                method: 'POST',
                json: {anonymous: '0', private: '0', tags: '>'}
            }, function(error, response, body){
                if(error) throw error;
                // Assert.
                assert.equal(response.statusCode, 400);
                assert.equal(body, "Bad request.");
            });
        });
    });

    describe('Image search', () => {
        it('should not search for an image with "<" or ">" in the tags', async () => {
            await clearDatabaseAsync();
            // There is nothing to arrange. Act.
            request({
                url: 'http://localhost:3000/search/5/0/hallo<',
                method: 'POST'
            }, function(error, response, body){
                if(error) throw error;
                // Assert.
                assert.equal(response.statusCode, 400);
                assert.equal(body, "Bad request.");
            });
        });

        it('should not process a request that asks for more than 20 images', async () => {
            await clearDatabaseAsync();
            // There is nothing to arrange. Act.
            request({
                url: 'http://localhost:3000/search/21/0/hallo',
                method: 'POST'
            }, function(error, response, body){
                if(error) throw error;
                // Assert.
                assert.equal(response.statusCode, 400);
                assert.equal(body, "Bad request.");
            });
        });
    });

    describe('Rate image', () => {
        it('should not rate an image that does not exist', async() => {
            await clearDatabaseAsync();
            // Arrange. Create an account.
            request({
				url: 'http://localhost:3000/register',
				method: 'POST',
				json: {username: 'heydude1', password: 'username', email: 'a1@a.aa'}
			}, async function(error, response, body) {
                if(error) throw error;
                const token = body.token;
                // setTimeout is necessary because sometimes there were cases where the database has not written the new user
                // into the database yet.
                setTimeout(async function() {
                    //Act.
                    request({
                        url: 'http://localhost:3000/voteImage/999998',
                        method: 'PUT',
                        json: {ratingValue: '1'},
                        headers: {
                            'x-access-token': token
                        }
                    }, async function(error1, response1, body1) {
                        if(error1) throw error1;
                        const res = await mysql_query_async().query('SELECT * FROM images');
                        // Assert.
                        assert.equal(response1.statusCode, 404);
                        assert.equal(body1, "Image does not exist.");
                    });
                }, 500);
            });
        });

        it('should not give an image an invalid rating', async() => {
            await clearDatabaseAsync();
            // Arrange. Create an account.
            request({
				url: 'http://localhost:3000/register',
				method: 'POST',
				json: {username: 'heydude1', password: 'username', email: 'a1@a.aa'}
			}, async function(error, response, body) {
                if(error) throw error;
                const token = body.token;
                await mysql_query_async().query('INSERT INTO images (ID, Deleted) VALUES (999222, 0)')
                // setTimeout is necessary because sometimes there were cases where the database has not written the new user
                // into the database yet.
                setTimeout(async function() {
                    //Act.
                    request({
                        url: 'http://localhost:3000/voteImage/999222',
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

        it('should not rate an image withoug being logged in', async() => {
            // Nothing to arrange. Act.
            request({
                url: 'http://localhost:3000/voteImage/999995',
                method: 'PUT',
                json: {ratingValue: '1'},
            }, async function(error1, response1, body1) {
                if(error1) throw error1;
                // Assert.
                assert.equal(response1.statusCode, 401);
                assert.equal(body1, "Not logged in.");
            });
        });

        it('should not rate an image twice from the same user', async() => {
            await clearDatabaseAsync();
            // Arrange. Create an account.
            request({
				url: 'http://localhost:3000/register',
				method: 'POST',
				json: {username: 'heydude1', password: 'username', email: 'a1@a.aa'}
			}, async function(error, response, body) {
                if(error) throw error;
                const token = body.token;
                await mysql_query_async().query('INSERT INTO images (ID, Deleted) VALUES (999221, 0)')
                // setTimeout is necessary because sometimes there were cases where the database has not written the new user
                // into the database yet.
                setTimeout(async function() {
                    // Vote the image for the first time.
                    request({
                        url: 'http://localhost:3000/voteImage/999221',
                        method: 'PUT',
                        json: {ratingValue: '1'},
                        headers: {
                            'x-access-token': token
                        }
                    }, async function(error1, response1, body1) {
                        if(error1) throw error1;
                        // Act. Vote the image for the second time.
                        request({
                            url: 'http://localhost:3000/voteImage/999221',
                            method: 'PUT',
                            json: {ratingValue: '1'},
                            headers: {
                                'x-access-token': token
                            }
                        }, async function(error2, response2, body2) {
                            if(error2) throw error2;
                            // Assert.
                            assert.equal(response2.statusCode, 403);
                            assert.equal(body2, "Already voted this image.");
                        });
                    });
                }, 500);
            });
        });
    });

    describe('Delete image', () => {
        it('should not delete an image that does not exist', async() => {
            // Arrange. Create a user.
            request({
				url: 'http://localhost:3000/register',
				method: 'POST',
				json: {username: 'heydude1', password: 'username', email: 'a1@a.aa'}
			}, async function(error, response, body) {
                if(error) throw error;
                const token = body.token;
                // Act.
                request({
                    url: 'http://localhost:3000/image/888888',
                    method: 'DELETE',
                    headers: {
                        'x-access-token': token
                    }
                }, async function(error1, response1, body1) {
                    if(error1) throw error1;
                    // Assert.
                    assert.equal(response1.statusCode, 404);
                    assert.equal(body1, "Image does not exist.");
                });
            });
        });

        it('should not delete an image without being logged in', async() => {
            // Nothing to arrange. Act.
            request({
				url: 'http://localhost:3000/image/222222',
				method: 'DELETE'
			}, async function(error, response, body) {
                if(error) throw error;
                // Assert.
                assert.equal(response.statusCode, 401);
                assert.equal(body, "Not logged in.");
            });
        });

        it('should not delete an image that does not belong to the requester', async () => {
            await clearDatabaseAsync();
            const db = mysql_query_async();
            // Arrange. Create the uploader of the user
			request({
				url: 'http://localhost:3000/register',
				method: 'POST',
				json: {username: 'heydude1', password: 'username', email: 'a1@a.aa'}
			}, async function(error, response, body) {
                if(error) throw error;
                // setTimeout is necessary because sometimes there were cases where the database has not written the new user
                // into the database yet.
                setTimeout(async function() {
                    // Fetch the uploader's ID that is needed for the image as foreign key.
                    const userId = (await db.query('SELECT * FROM user WHERE Username = ?', ['heydude1']))[0].ID;
                    // Insert the image.
                    await db.query('INSERT INTO images (ID, Uploader, Private, Anonymous, Deleted) VALUES (999944,'+userId+', 1, 0, 0)');
                    // Register the second user.
                    setTimeout(async function() {
                        request({
                            url: 'http://localhost:3000/register',
                            method: 'POST',
                            json: {username: 'heydude3', password: 'username', email: 'a3@a.aa'}
                        }, async function(error2, response2, body2) {
                            if(error2) throw error2;
                            const token = body2.token;
                            request({
                                url: 'http://localhost:3000/image/999944',
                                headers: {
                                    'x-access-token': token
                                },
                                method: 'DELETE'
                            }, function(error3, response3, body3){
                                if(error3) throw error3;
                                // Assert.
                                //assert.equal(response3.statusCode, 403);
                                assert.equal(body3, "No authorization.");
                            });
                        });
                    }, 100);
            }, 100);
			});
        });
    });

    describe('Report image', () => {
        
        it('should not report an image without the reporter being logged in', () => {
            // Nothing to arrange. Act.
            request({
                url: 'http://localhost:3000/image/report/111111',
                method: 'PUT',
                json: {text: 'xd'}
            }, async function(error, response, body) {
                if(error) throw error;
                // Assert.
                assert.equal(response.statusCode, 401);
                assert.equal(body, "Not logged in.");
            });
        });
        
        it('should not report an image twice from the same user', async() => {
            await clearDatabaseAsync();
            // Arrange. Create an account.
            request({
				url: 'http://localhost:3000/register',
				method: 'POST',
				json: {username: 'heydude4', password: 'username', email: 'a4@a.aa'}
			}, async function(error, response, body) {
                if(error) throw error;
                const token = body.token;
                console.log(token);
                await mysql_query_async().query('INSERT INTO images (ID, Deleted) VALUES (999220, 0)')
                // setTimeout is necessary because sometimes there were cases where the database has not written the new user
                // into the database yet.
                setTimeout(async function() {
                    // Report the image for the first time.
                    request({
                        url: 'http://localhost:3000/image/report/999220',
                        method: 'PUT',
                        json: {text: 'report1'},
                        headers: {
                            'x-access-token': token
                        }
                    }, async function(error1, response1, body1) {
                        if(error1) throw error1;
                        // Act. Report the image for the second time.
                        request({
                            url: 'http://localhost:3000/image/report/999220',
                            method: 'PUT',
                            json: {text: 'report2'},
                            headers: {
                                'x-access-token': token
                            }
                        }, async function(error2, response2, body2) {
                            if(error2) throw error2;
                            // Assert.
                            assert.equal(response2.statusCode, 400);
                            assert.equal(body2, "You have already reported this image.");
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