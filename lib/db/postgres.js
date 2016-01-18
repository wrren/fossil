"use strict";

var ModelFields = require( "../fields" );

//
//	Provides database inspection utility functions that cannot be found in knex
//
class PostgresUtils {
	constructor( config, db ) {
		this.db 	= db;
		this.config = config;
	}

	//
	//	Read all tables from the connected database and generate a ModelFields object
	//	for each one containing data on each table's fields.
	//
	tables() {
		return this.db.raw( "SELECT * FROM pg_tables WHERE schemaname='public'", [] ).then( ( response ) => {
			return response.rows.map( ( value, index, array ) => {
				return value.tablename;
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
			return 		type.includes( "char" ) ? "string" :
						type.includes( "text" ) ? "string" :
						type.includes( "int" ) ? "number" :
						type.includes( "real" ) ? "number" :
						type.includes( "boolean" ) ? "boolean" :
							undefined;
		};

		let getKey = ( key ) => {
			return key === "true" ? "primary" :
				undefined;
		};

		return this.db.raw( "SELECT c.column_name, c.data_type, CASE WHEN k.column_name IS NULL THEN 'false' " +
							"ELSE 'true' END AS key FROM information_schema.columns AS c LEFT JOIN " +
							"information_schema.key_column_usage AS k ON c.table_catalog = k.table_catalog AND " +
							"c.column_name = k.column_name WHERE c.table_name = ?",
							[table] ).then( ( response ) => {
			return response.rows.map( ( value, index, array ) => {
				return {
					name: value.column_name,
					key: getKey( value.key ),
					type: getType( value.data_type )
				};
			} );
		} );
	}
}

module.exports = PostgresUtils;