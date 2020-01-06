const util = require( 'util' );
const mysql = require( 'mysql' );
const dbConfig = require('./dbConfig');

const makeDb = function makeDbb() {
  const connection = mysql.createConnection( dbConfig );
  return {
    query( sql, args ) {
      return util.promisify( connection.query )
        .call( connection, sql, args );
    },
    close() {
      return util.promisify( connection.end ).call( connection );
    }
  };
}

module.exports = makeDb;