const mysql = require('mysql');
const dbConfig = require('./dbConfig');

/*
 * @sqlConnection
 * Creates the connection, makes the query and close it to avoid concurrency conflicts.
 */
var sqlConnection = function sqlConnection(sql, values, next) {

    // It means that the values have not been passed.
    /*if (arguments.length === 2) {
        next = values;
        values = null;
    }*/

    var connection = mysql.createConnection({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database
    });
    
    connection.connect(function(err) {
        if (err !== null) {
            console.log("[MYSQL] Error connecting to mysql:" + err+'\n');
        }
    });

    connection.query(sql, values, function(err) {

        // Close the connection.
        connection.end();

        if (err) {
            throw err;
        }

        // Execute the callback.
        if (next !== undefined)
            next.apply(this, arguments);
    });
}

module.exports = sqlConnection;