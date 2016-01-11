"use strict";

var namer = require( './namer' );

class ModelFields {
	constructor( fields ) {
		this._fields 		= fields;
		this._keys 			= [];
		this._primaryKey 	= undefined;
		this._mappings 		= new Map();

		fields.forEach( ( value, index, array ) => {
			if( value.key == "primary" ) {
				this._primaryKey = value.name;
			}
			if( value.key != "" ) {
				this._keys.push( value.name );
			}
		} );
	}

	//
	//	Given a result row, assign values to the given model object's fields, modifying
	//	member names to conform to member naming style during assignment.
	//
	assign( row, obj ) {
		this._fields.forEach( ( field, index, array ) => {
			if( field.name in row ) {
				let property = namer.toMemberName( field.name );

				if( this._mappings.has( field.name ) ) {
					property = this._mappings.get( field.name );
				}
				obj[property] = row[field.name];
			}
		} );
		return obj;
	}

	//
	//	Merge field mapping overrides from the given mapping object
	//
	merge( mappings ) {
		this._mappings = mappings;
		return this;
	}

	//
	//	List all model fields
	//
	get list() {
		return this._fields;
	}

	//
	//	Get the name of the primary key field
	//
	get primaryKey() {
		return this._primaryKey;
	}
}

module.exports = ModelFields;