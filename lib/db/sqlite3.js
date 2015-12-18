"use strict";

var ModelFields = require( "../fields" );

//
//	Provides database inspection utility functions that cannot be found in knex
//
class SQLiteUtils {
	constructor( db ) {
		this.db = db;
	}

	//
	//	Read all tables from the connected database and generate a ModelFields object
	//	for each one containing data on each table's fields.
	//
	tables() {
		return this.db.raw( "SELECT name FROM sqlite_master WHERE type='table'", [] ).then( ( response ) => {
			return response.map( ( value, index, array ) => {
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
				    type.includes( "real" ) ? "number" :
					undefined;
		};

		let getKey = ( key ) => {
			return key == 1 ? "primary" :
			    undefined;
		};

		return this.db.raw( "PRAGMA table_info(??)", [table] ).then( ( response ) => {
			return response.map( ( value, index, array ) => {
				return {
					name: value.name,
					key: getKey( value.pk ),
					type: getType( value.type )
				};
			} );
		} );
	}
}

module.exports = SQLiteUtils;