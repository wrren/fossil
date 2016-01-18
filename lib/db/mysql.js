"use strict";

var ModelFields = require( "../fields" );

//
//	Provides database inspection utility functions that cannot be found in knex
//
class MySQLUtils {
	constructor( config, db ) {
		this.db = db;
	}

	//
	//	Read all tables from the connected database and generate a ModelFields object
	//	for each one containing data on each table's fields.
	//
	tables() {
		return this.db.raw( "SHOW TABLES", [] ).then( ( response ) => {
			return response[0].map( ( value, index, array ) => {
				return value[Object.keys( value )[0]];
			} );
		} ).then( ( tables ) => {
			return Promise.all( tables.map( ( table, index, array ) => {
				return this.fields( table )
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

	//
	//      Given a single table name, generate a list of fields for
	//      the model associated with that table, based on the table's columns.
	//      Returns a Promise object.
	//
	fields( table ) {
		let getType = ( type ) => {
			return 	type.includes( "char" ) ? "string" :
			    	type.includes( "text" ) ? "string" :
				type.includes( "int" ) ? "number" :
				undefined;
		};

		let getKey = ( key ) => {
			return key.includes( "PRI" ) ? "primary" :
			    key.includes( "UNI" ) ? "unique" :
				undefined;
		};

		return this.db.raw( "SHOW COLUMNS FROM ??", [table] ).then( ( response ) => {
			return response[0].map( ( value, index, array ) => {
				return {
					name: value.Field,
					key: getKey( value.Key ),
					type: getType( value.Type )
				};
			} );
		} );
	}
}

module.exports = MySQLUtils;
