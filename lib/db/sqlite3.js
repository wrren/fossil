"use strict";

var ModelFields = require( "../fields" );

//
//	Provides database inspection utility functions that cannot be found in knex
//
class SQLiteUtils {
	constructor( db ) {
		this.db = db;
	}
}

module.exports = SQLiteUtils;