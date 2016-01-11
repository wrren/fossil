"use strict";

var namer 			= require( "./namer" );
var validator		= require( "./validator" );

var Relationships	= require( "./relationships" );

//
//	Caches Model attributes at runtime and can optionally save/load from external storage in order to reduce up
//	startup times.
//
class FossilCache {
	//
	//	Construct a cache object that will interact with the database using the given handle and database
	// 	utilities object
	//
	constructor( db, utils ) {
		this._db 			= db;
		this._utils 		= utils;
		this._tableReader	= null;
		this._tables		= new Map();
		this._fields 		= new Map();
		this._mappings 		= new Map();
		this._relationships	= new Map();
		this._validations 	= new Map();
	}

	//
	//	Get or set the table name for a given model.
	//
	table( model, name ) {
		if( name == undefined ) {
			if( !this._tables.has( model ) ) {
				this._tables.set( model, namer.toTableName( model ) );
			}
			return this._tables.get( model );
		} else {
			this._tables.set( model, name );
		}
	}

	//
	//	Get or set the ModelFields object for the given model. Returns a promise object.
	//
	fields( model, fields ) {
		if( fields == undefined ) {
			let table = this.table( model );

			if( !this._fields.has( model ) ) {
				if( this._tableReader == null ) {
					this._tableReader = this._utils.tables()
						.then( ( f ) => {
							this._fields = f;
							return f;
						} );
				} else {
					this._tableReader = Promise.resolve( this._fields );
				}

				return this._tableReader.then( ( f ) => {
					this._fields.set( model, f.get( table ).merge( this.mappings( model ) ) );
					return this._fields.get( model );
				} );
			}

			return Promise.resolve( this._fields.get( model ) );
		} else {
			this._fields.set( model, fields );
		}
	}

	validations( model, validations ) {
		if( validations == undefined ) {
			if( !this._validations.has( model ) ) {
				this._validations.set( model, {} );
			}
			return this._validations.get( model );
		} else {
			this._validations.set( model, validator.generate( validations ) );
		}
	}

	//
	//	Get or set property->table field mapping overrides for the given model
	//
	mappings( model, mappings ) {
		if( mappings == undefined ) {
			if( !this._mappings.has( model ) ) {
				this._mappings.set( model, new Map() );
			}
			return this._mappings.get( model );
		} else {
			this._mappings.set( model, mappings );
		}
	}

	//
	//	Get or set the relationships for the given model
	//
	relationships( model, relationships ) {
		if( relationships == undefined ) {
			if( !this._relationships.has( model ) ) {
				this._relationships.set( model, new Relationships( model ) );
			}
			return this._relationships.get( model );
		} else {
			this._relationships.set( model, relationships );
		}
	}
}

module.exports = function( db, utils ) {
	return new FossilCache( db, utils );
}