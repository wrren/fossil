var MySQLUtils 		= require( "./db/mysql" );
var PostgresUtils	= require( "./db/postgres" );
var SQLiteUtils 	= require( "./db/sqlite3" );

module.exports = function( config, db ) {
	switch( config.client ) {
		case "sqlite" : return new SQLiteUtils( config, db );
		case "mysql": 	return new MySQLUtils( config, db );
		case "pg":		return new PostgresUtils( config, db );
	}
}