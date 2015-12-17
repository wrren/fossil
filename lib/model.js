"use strict";

var knex 	= require( "knex" );
var ModelFields = require( "./fields" );
var namer 	= require( "./namer" );

var db         	= null;
var dbUtils 	= null;
var fields 	= new Map();
var initializer	= null;

class Model {
	constructor() {
		if( new.target == Model ) {
			throw "Model cannot be constructed directly";
		}
		this.table = namer.toTableName( new.target.name );
	}

	//
	//	Configure the Model type, this will create a database connection and
	//	initialize various internal systems.
	//
	static config( config ) {
		db 	= knex( config );
		dbUtils = require( "./database" )( config.client, db );
	}

	//
	//      Get the model object's unique ID
	//
	get id() {
		return this[this.fields.primaryKey];
	}

	//
	//      Set the model object's unique ID
	//
	set id( val ) {
		this[this.fields.primaryKey] = val;
	}

	//
	//      Get the name of this model's
	//
	get primaryKey() {
	}

	//
	//      Get the name of the table in which this model is stored
	//
	get table() {
		return this._table
	}

	//
	//      Set the name of the table in which this model is stored
	//
	set table( val ) {
		this._table = val;
	}

	//
	//	Convert a result set to a list of model objects
	//
	static toObject( row, model, fields ) {
		let obj = new global[model]();


	}

	//
	//	Get all instances of this model stored in the database
	//
	static get all() {
		if( this.name == "Model" ) {
			throw "Cannot invoke find directly on Model class";
		}

		var table = namer.toTableName( this.name );
		var model = this.name;

		return this.initialize( table )
			.then( ( fields ) => {
				let where 	= typeof id == 'number' ? { [fields.primaryKey]: id } : id;
				return db( table ).select( '*' ).where( query ).then
			} );
	}

	//
	//      Find the record with the given ID or properties. If ID is a number,
	//      the record with the given unique ID will be found, otherwise if ID
	//      is an object mapping fields to values, the record with the given field
	//      values will be found. Returns a Promise object.
	//
	static find( id, options ) {
		if( this.name == "Model" ) {
			throw "Cannot invoke find directly on Model class";
		}

		var table = namer.toTableName( this.name );
		var model = this.name;

		return this.initialize( table )
			.then( ( fields ) => {
				let where 	= typeof id == 'number' ? { [fields.primaryKey]: id } : id;
				let select 	= db( table ).select( '*' ).where( query );

				if( options != undefined ) {
					if( options.hasOwnProperty( "limit" ) && typeof options.limit == 'number' ) {
						select = select.limit( options.limit );
					}
					if( options.hasOwnProperty( "offset" ) && typeof options.limit == 'offset' ) {
						select = select.offset( options.offset );
					}
				}
			} );
	}

	//
	//      Read all tables in the currently selected database and generate
	//      a mapping of models to their properties. Returns a Promise object.
	//
	static initialize( table ) {
		if( initializer == null ) {
			initializer = dbUtils.tables()
				.then( ( f ) => {
					fields = f;
					return fields;
				} );
		} else if( fields != null ) {
			initializer = Promise.resolve( fields );
		}
		return initializer.then( ( f ) => {
			if( table == undefined ) {
				return f;
			} else {
				return f.get( table );
			}
		} );
	}

	//
	//      Given a single table name, generate a list of fields for
	//      the model associated with that table, based on the table's columns.
	//      Returns a Promise object.
	//
	static getFields( table ) {
		let getType = ( type ) => {
			return type.includes( "char" ) ? "string" :
				type.includes( "text" ) ? "string" :
					type.includes( "int" ) ? "number" :
						undefined;
		};

		let getKey = ( key ) => {
			return key.includes( "PRI" ) ? "primary" :
				key.includes( "UNI" ) ? "unique" :
					undefined;
		};

		return db.raw( "SHOW COLUMNS FROM ??", [table] ).then( ( response ) => {
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

module.exports = Model;