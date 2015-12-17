"use strict";

var ModelFields = require( "../fields" );

//
//	Provides database inspection utility functions that cannot be found in knex
//
class MySQLUtils {
	constructor( db ) {
		this.db = db;
	}

	//
	//	Read all tables from the connected database and generate a ModelFields object
	//	for each one containing data on each table's fields.
	//
	static tables() {
		this.db.raw( "SHOW TABLES", [] ).then( ( response ) => {
			return response[0].map( ( value, index, array ) => {
				return value[Object.keys( value )[0]];
			} );
		} ).then( ( tables ) => {
			return Promise.all( tables.map( ( table, index, array ) => {
				return Model.getFields( table )
					.then( ( fields ) => {
						return {
							name: table,
							fields: fields
						};
					} );
			} ) ).then( ( models ) => {
				let fields = new Map();

				models.forEach( ( value, index, array ) => {
					fields.set( value.name, new ModelFields( value.fields ) );
				} );

				return fields;
			} );
		} );
	}
}

module.exports = MySQLUtils;
