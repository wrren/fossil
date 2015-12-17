"use strict";

var ModelFields = require( "../fields" );

//
//	Provides database inspection utility functions that cannot be found in knex
//
class PostgresUtils {
	constructor( db ) {
		this.db = db;
	}
}

module.exports = PostgresUtils;