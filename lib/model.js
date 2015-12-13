"use strict";

var ModelFields         = require("./fields");

var db 			= null;
var modeFields          = new Map();

class Model {
	constructor() {
		if( new.target == Model ) {
			throw "Model cannot be constructed directly";
		}
		this.table = Model.determineTableName( new.target.name );
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
	//      Find the record with the given ID or properties. If ID is a number,
	//      the record with the given unique ID will be found, otherwise if ID
	//      is an object mapping fields to values, the record with the given field
	//      values will be found. Returns a Promise object.
	//
	static find( id ) {
		if( this.name == "Model" ) {
			throw "Cannot invoke find directly on Model class";
		}
		let table = Model.determineTableName( this.name );
		
	}

	//
	//      Find the record with the given unique ID
	//
	static findByID( table, id ) {
		return Model.initialize()
			.then( ( fields ) => { return properties[table]; })
			.then( ( fields ) => {
				fields = new ModelFields( fields );
				return  db.select( fields.list )
					.from( table )
					.where( { [fields.primaryKey]: id } )
					.then( ( rows ) => {
						if( rows.length ) {

						} else {

						}
					} );
			} );
	}

	//
	//      Find the record with the given field values
	//
	static findByFields( table, where ) {
		return Model.initialize()
			.then( ( fields ) => { return properties[table]; })
			.then( ( fields ) => {
				fields = new ModelFields( fields );
				return  db.select( fields.list )
					.from( table )
					.where( where )
					.then( ( rows ) => {
						if( rows.length ) {

						} else {

						}
					} );
			} );
	}
	
	//
	//      Read all tables in the currently selected database and generate
	//      a mapping of models to their properties. Returns a Promise object.
	//
	static initialize() {
		if( modelFields.size > 0 ) {
			Promise.resolve( modelFields );
		}

		return db.raw( "SHOW TABLES", [] ).then( ( response ) => {
			return response[0].map( ( value, index, array ) => {
				return value[Object.keys(value)[0]];
			} );
		} ).then( ( tables ) => {
			return Promise.all( tables.map( ( value, index, array ) => {
				return Model.getFields( value )
				.then( ( fields ) => {
					return {
						name: value,
						fields: fields
					};
				});
			} ) ).then( ( models ) => {
				modelFields.clear();

				models.forEach( ( value, index, array ) => {
					modelFields.set( value.name, new ModelFields( value.fields ) );
				} );

				return modelFields;
			} );
		} );
	}

	//
	//      Given a single table name, generate a list of fields for
	//      the model associated with that table, based on the table's columns.
	//      Returns a Promise object.
	//
	static getFields( table ) {
		let getType = ( type ) => {
			return  type.includes( "char" ) ? "string" :
			type.includes( "text" ) ? "string" :
			type.includes( "int" ) ? "number" :
			undefined;
		};

		let getKey = ( key ) => {
			return  key.includes( "PRI" ) ? "primary" :
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
			});
		});
	}

	//
	//      Generate the default table name based on the invoking class name
	//
	static determineTableName( className ) {
		let mappings = {
			"Person": "people",
			"User": "users",
			"Mouse": "mice"
		};

		if( className in mappings ) {
			return mappings[className];
		}

		let tableName = "";

		for ( var i = 0; i < className.length; i++ ) {
			if( className[i] >= 'A' && className[i] <= 'Z' ) {
				if( i == 0 ) {
					tableName += className[i].toLowerCase();
				} else {
					tableName += "_" + className[i].toLowerCase();
				}
			} else {
				tableName += className[i];
			}
		}

		if( tableName[tableName.length - 1] == 's' ) {
			return tableName + "es";
		} else if( tableName[tableName.length - 1] == 'y' ) {
			return tableName.slice(0, -1) + "ies";
		} else {
			return tableName + "s";
		}
	}

	static set db( val ) {
		db = val;
	}

	static get db() {
		return db;
	}
}

module.exports = Model;