const assert = require('assert');
const mysql_query_async = require('../mysql_query_async');
const app = require('../index');
const request = require('request');

// #####
// The tests are written in the following way:
// 1) Arrange: predefine necessary data in the database.
// 2) Act: perform the method unter test.
// 3) Assert: check the output/result against the desired result.
// #####

describe('UserController', () => {
	after(() => {
		setTimeout(function() { app.close(); }, 1000);
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

		it('should not create a new user, because the username is already used', async () => {
			await clearDatabaseAsync();
			// Arrange. Create a user that uses the same username.
			const db = mysql_query_async();
			try {
				await db.query('INSERT INTO user (Username, Password, EMail, Deleted, isAdmin) VALUES ("Hello", 123, "Hello@Hello.de", 0, 0);');
			} catch(err) {
				if(err) throw err;
			} finally {
				await db.close();
			}
			// Act. Do the request.
			request({
				url: 'http://localhost:3000/register',
				method: 'POST',
				json: {username: 'Hello', password: 'Hello123123', email: 'd@Hello.de'}
			}, function(error, response, body){
				if(error) throw error;
				// Assert.
				assert.equal(response.statusCode, 400);
				assert.equal(body, "User already exists.")
			});
		});

		it('should not create a new user, because the email is already used', async () => {
			await clearDatabaseAsync();
			// Arrange. Create a user that uses the same email.
			const db = mysql_query_async();
			try {
				await db.query('INSERT INTO user (Username, Password, EMail, Deleted, isAdmin) VALUES ("Hello", 123, "Hello@Hello.de", 0, 0);');
			} catch(err) {
				if(err) throw err;
			} finally {
				await db.close();
			}
			// Act. Do the request.
			request({
				url: 'http://localhost:3000/register',
				method: 'POST',
				json: {username: 'Hello123', password: 'Hello123123', email: 'Hello@Hello.de'}
			}, function(error, response, body){
				if(error) throw error;
				// Assert.
				assert.equal(response.statusCode, 400);
				assert.equal(body, "User already exists.")
			});
		});

		it('should not create a new user, because the user is already logged in', async () => {
			await clearDatabaseAsync();
			// Arrange. Create a new user.
			request({
				url: 'http://localhost:3000/register',
				method: 'POST',
				json: {username: 'Hello123', password: 'Hello123123', email: 'Hello@Hello.de'}
			}, function(error1, response1, body1) {
				if(error1) throw error1;
				// Log in with the same credentials.
				request({
					url: 'http://localhost:3000/login',
					method: 'POST',
					json: {username: 'Hello123', password: 'Hello123123'}
				}, function(error2, response2, body2) {
					if(error2) throw error2;
					// Act. Do the request.
					const token = body2.token;
					request({
						url: 'http://localhost:3000/register',
						method: 'POST',
						headers: {
							'x-access-token': token
						},
						json: {username: 'Hello123', password: 'Hello123123', email: 'Hello@Hello.de'}
					}, function(error3, response3, body3){
						if(error3) throw error3;
						// Assert.
						assert.equal(response3.statusCode, 400);
						assert.equal(body3, "Already logged in.")
					});
				});
			});
		});

		it('should reject creating user because the email is longer than 254 characters', async () => {
			await clearDatabaseAsync();
			// Nothing to arrange.
			// Act. 
			request({
				url: 'http://localhost:3000/register',
				method: 'POST',
				json: {username: 'Hello1234', password: 'Hello123123', email: 'HelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHello'}
			}, function(error0, response0, body0) {
				if(error0) throw error0;
				// Assert.
				assert.equal(response0.statusCode, 400);
				assert.equal(body0, "Bad request.")
			});
		});
	});

	describe('Login', () => {
		it('should not log in, because the user is already logged in', async () => {
			await clearDatabaseAsync();
			// Arrange. Create a new user.
			request({
				url: 'http://localhost:3000/register',
				method: 'POST',
				json: {username: 'Hello123', password: 'Hello123123', email: 'Hello@Hello.de'}
			}, function(error1, response1, body1) {
				if(error1) throw error1;
				request({
					url: 'http://localhost:3000/login',
					method: 'POST',
					json: {username: 'Hello123', password: 'Hello123123'}
				}, function(error2, response2, body2) {
					if(error2) throw error2;
					// Act. Do the request.
					const token = body2.token;
					request({
						url: 'http://localhost:3000/login',
						method: 'POST',
						headers: {
							'x-access-token': token
						},
						json: {username: 'Hello123', password: 'Hello123123'}
					}, function(error3, response3, body3){
						if(error3) throw error3;
						// Assert.
						assert.equal(response3.statusCode, 400);
						assert.equal(body3, "Already logged in.")
					});
				});
			});
		});

		it('should not log in, because the user does not exist.', async () => {
			await clearDatabaseAsync();
			// Nothing to arrange.
			// Act. Log in.
			request({
				url: 'http://localhost:3000/login',
				method: 'POST',
				json: {username: 'Hello123', password: 'Hello123123'}
			}, function(error3, response3, body3){
				if(error3) throw error3;
				// Assert.
				assert.equal(response3.statusCode, 404);
				assert.equal(body3, "Username does not exist.")
			});
		});
	});
	describe('Delete', () => {
		it('should return error, because trying do delete an already deleted user does not work', async () => {
			await clearDatabaseAsync();
			// Arrange. Create a user.
			var token;
			request({
				url: 'http://localhost:3000/register',
				method: 'POST',
				json: {username: 'Hello1234', password: 'Hello123123', email: 'Hello@Hello.de'}
			}, function(error1, response1, body1) {
				if(error1) throw error1;
				token = body1.token;
				// Delete the user.
				request({
					url: 'http://localhost:3000/user',
					method: 'DELETE',
					headers: {
						'x-access-token': token
					}
				}, function(error3, response3, body3) {
					if(error3) throw error3;
					// Act. Try do delete the user a second time.
					request({
						url: 'http://localhost:3000/user',
						method: 'DELETE',
						headers: {
							'x-access-token': token
						}
					}, function(error2, response2, body2) {
						if(error2) throw error2;
						// Assert.
						assert.equal(response2.statusCode, 404);
						assert.equal(body2, "User does not exist.")
					});
				});
			});
		});
	});
	describe('Change user information', () => {
		it('should reject changing user information because the user is not logged in', async () => {
			await clearDatabaseAsync();
			// Nothing to arrange.
			// Act. Try to change user information without being logged in.
			request({
				url: 'http://localhost:3000/user',
				method: 'PUT',
				json: {currentPassword: '12345678', newPassword: '123456789'}
			}, function(error1, response1, body1) {
				if(error1) throw error1;
				// Assert.
				assert.equal(response1.statusCode, 401);
				assert.equal(body1, "Not logged in.")
			});
		});

		it('should reject changing user information because the old password is missing in the request', async () => {
			await clearDatabaseAsync();
			// Nothing to arrange.
			// Act. Try to change user information without being logged in.
			request({
				url: 'http://localhost:3000/user',
				method: 'PUT',
				json: {newPassword: '123456789'}
			}, function(error1, response1, body1) {
				if(error1) throw error1;
				// Assert.
				assert.equal(response1.statusCode, 400);
				assert.equal(body1, "Bad request.")
			});
		});
		
		it('should reject changing user information because the old password is wrong', async () => {
			await clearDatabaseAsync();
			// Arrange. Create a user.
			request({
				url: 'http://localhost:3000/register',
				method: 'POST',
				json: {username: 'Hello1234', password: 'Hello123123', email: 'Hello@Hello.de'}
			}, function(error0, response0, body0) {
				if(error0) throw error0;
				const token = body0.token;
				// Act. Try to change user information without being logged in.
				request({
					url: 'http://localhost:3000/user',
					method: 'PUT',
					json: {currentPassword: 'WrongPassword', newPassword: '123456789'},
					headers: {
						'x-access-token': token
					}
				}, function(error1, response1, body1) {
					if(error1) throw error1;
					// Assert.
					assert.equal(response1.statusCode, 403);
					assert.equal(body1, "Wrong password.")
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