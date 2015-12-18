var MySQLUtils 		= require( "./db/mysql" );
var PostgresUtils	= require( "./db/postgres" );
var SQLiteUtils 	= require( "./db/sqlite3" );

module.exports = function( dbType, db ) {
	switch( dbType ) {
		case "sqlite" : return new SQLiteUtils( db );
		case "mysql": 	return new MySQLUtils( db );
		case "pg":		return new PostgresUtils( db );
	}
}