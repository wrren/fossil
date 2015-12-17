var MySQLUtils 		= require( "./db/mysql" );
var PostgresUtils	= require( "./db/postgres" );
var SQLiteUtils 	= require( "./db/sqlite3" );

module.exports = function( dbType, db ) {
	switch( dbType ) {
		case "sqlite3" : 	return new MySQLUtils( db );
		case "mysql": 		return new PostgresUtils( db );
		case "pg":		return new SQLiteUtils( db );
	}
}