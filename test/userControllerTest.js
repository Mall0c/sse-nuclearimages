const assert = require('assert');
const mysql_query = require('../mysql_query');
const app = require('../index');
const request = require('request');

describe('Controller tests', () => {
	describe('User controller tests', () => {
		after(() => {
			setTimeout(function() { app.close(); }, 5000);
		});

		describe('Register', () => {
			it('should create a new user', (done) => {
				clearDatabase(() => {
					request({
						url: 'http://localhost:3000/register',
						method: 'POST',
						json: {username: 'heydude1', password: 'username', email: 'a1@a.aa'}
					}, function(error, response, body){
						if(error) throw error;
						console.log(body);
						done();
					});
				});
			});
		});
	});
});

const clearDatabase = (next) => {
	mysql_query('DELETE FROM comments WHERE 1=1', [], (err1, result1, fields1) => {
		if(err1) throw err1;
		mysql_query('DELETE FROM comments_ratings WHERE 1=1', [], (err2, result2, fields2) => {
			if(err2) throw err2;
			mysql_query('DELETE FROM comments_reports WHERE 1=1', [], (err3, result3, fields3) => {
				if(err3) throw err3;
				mysql_query('DELETE FROM images WHERE 1=1', [], (err4, result4, fields4) => {
					if(err4) throw err4;
					mysql_query('DELETE FROM images_ratings WHERE 1=1', [], (err5, result5, fields5) => {
						if(err5) throw err5;
						mysql_query('DELETE FROM comments_reports WHERE 1=1', [], (err6, result6, fields6) => {
							if(err6) throw err6;
							mysql_query('DELETE FROM user WHERE 1=1', [], (err7, result7, fields7) => {
								if(err7) throw err7;
								console.log(5);
								next();
							});
						});
					});
				});
			});
		});
	});
};