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
	// Given an object member name, retrieve the database field name with which it's associated
	//
	field( member ) {
		for( var entry of this._mappings ) {
			if( entry[1] == member ) {
				return entry[0];
			}
		}
		for( var entry of this._fields ) {
			let property = namer.toMemberName( entry.name );

			if( property == member ) {
				return entry.name;
			}
		}
		return null;
	}

	//
	//	Given an object mapping member names to values, return a new object that maps corresponding
	//	table field names to those same values
	//
	toFindObject( find ) {
		let translated = new Object();

		for( var key in find ) {
			if( find.hasOwnProperty( key ) && this.field( key ) !== null ) {
				translated[this.field(key)] = find[key];
			}
		}

		return translated;
	}

	//
	//	Given a table field name, retrieve the object member name with which it's associated
	//
	member( field ) {
		return this._mappings.get( field );
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

	//
	//	Given an object of the type mapped by this ModelFields object, generate an object that maps
	//	database field names to their corresponding values extracted from the provided object. Any undefined
	//	object members will not be included
	//
	toSaveObject( obj ) {
		let save = new Object();

		this._fields.forEach( ( field, index, array ) => {
			let property = this._mappings.has( field.name ) ? 	this._mappings.get( field.name ) :
																namer.toMemberName( field.name );

			if( obj.hasOwnProperty( property ) && obj[property] != undefined ) {
				save[field.name] = obj[property];
			}
		} );

		return save;
	}
}

module.exports = ModelFields;