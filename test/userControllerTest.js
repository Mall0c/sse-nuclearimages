const assert = require('assert');
const mysql_query = require('../mysql_query');
const mysql_query_async = require('../mysql_query_async');
const app = require('../index');
const request = require('request');

// #####
// The tests are written in the following way:
// 1) Arrange: predefine necessary data in the database.
// 2) Act: perform the method unter test.
// 3) Assert: check the output/result against the desired result.
// #####

describe('Controller tests', () => {
	describe('User controller tests', () => {
		after(() => {
			setTimeout(function() { app.close(); }, 5000);
		});

		describe('Register', () => {
			it('should create a new user', async () => {
				await clearDatabaseAsync();
				// There is nothing to arrange. Act.
				request({
					url: 'http://localhost:3000/register',
					method: 'POST',
					json: {username: 'heydude1', password: 'username', email: 'a1@a.aa'}
				}, function(error, response, body){
					if(error) throw error;
					// Assert.
					assert.equal(response.statusCode, 200);
					assert.equal(body.auth, true);
				});
			});

			it('should not create a new user, because the email is already used', async () => {
				await clearDatabaseAsync();
				// Arrange. Create a user that uses the same username and email.
				const db = mysql_query_async();
				try {
					await db.query('INSERT INTO user (Username, Password, EMail, Deleted, isAdmin) VALUES ("Hello", 123, "HelloHello.de", 0, 0);');
				} catch(err) {
					if(err) throw err;
				} finally {
					await db.close();
				}
				// Act. Do the request.
				request({
					url: 'http://localhost:3000/register',
					method: 'POST',
					json: {username: 'Hello', password: 'Hello123123', email: 'Hello@Hello.de'}
				}, function(error, response, body){
					if(error) throw error;
					// Assert.
					assert.equal(response.statusCode, 400);
					assert.equal(body, "User already exists.")
				});
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