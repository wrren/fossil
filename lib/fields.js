"use strict";

class ModelFields {
	constructor( fields ) {
		this._fields = fields;
		this._keys = [];
		this._primaryKey = undefined;

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
	//	Get a mapping of model-style names to field values
	//
	get modelFields() {

	}

	//
	//	Get a mapping of database-style names to field values
	//
	get dbFields() {

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
	//	Given a field name in database style, return the equivalent name in model style
	//
	static modelName( field ) {

	}
}

module.exports = ModelFields;