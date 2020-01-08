const assert = require('assert');
const mysql_query_async = require('../mysql_query_async');
const app = require('../index');
const request = require('request');

describe('ImageController', () => {
	after(() => {
		setTimeout(function() { app.close(); }, 5000);
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
                    await db.query('INSERT INTO images (ID, Uploader, Private, Anonymous, Deleted) VALUES (999,'+userId+', 1, 0, 0)');
                    // Register the second user.
                    request({
                        url: 'http://localhost:3000/register',
                        method: 'POST',
                        json: {username: 'heydude2', password: 'username', email: 'a2@a.aa'}
                    }, async function(error2, response2, body2) {
                        if(error2) throw error2;
                        const token = body2.token;
                        request({
                            url: 'http://localhost:3000/frontpage/999',
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