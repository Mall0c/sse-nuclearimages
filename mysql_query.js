const mysql = require('mysql');
const dbConfig = require('./dbConfig');
const logger = require('./logger');

/*
 * @sqlConnection
 * Creates the connection, makes the query and close it to avoid concurrency conflicts.
 */
var sqlConnection = function sqlConnection(sql, values, next) {

    var connection = mysql.createConnection({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database
    });
    
    connection.connect(function(err) {
        if (err !== null) {
            console.log('[MYSQL] Error connecting to mysql:' + err + '\n');
            logger.log({level: 'error', message: '[MYSQL] Error connecting to mysql:' + err.stack + '\n'});
        }
    });

    connection.query(sql, values, function(err) {

        // Close the connection.
        connection.end();

        if (err) {
            logger.log({level: 'error', message: err.stack});
        }

        // Execute the callback.
        if (next !== undefined)
            next.apply(this, arguments);
    });
}

module.exports = sqlConnection;