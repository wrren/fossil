"use strict";

var knex 			= require( "knex" );
var namer 			= require( "./namer" );
var validator		= require( "./validator" );

var cache			= null;
var db         		= null;

class Model {
	constructor() {
		if( this.constructor.name == Model ) {
			throw "Model cannot be constructed directly";
		}
		this.table = cache.table( this.constructor.name );
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
	//	Save the model's current state to the database
	//
	get save() {
		return cache.fields( this.constructor.name )
				.then( ( f ) => {
					validator.validate( this, cache.validations( this.constructor.name ) );

					return this._update( f.toSaveObject( this ) )
						.then( ( rows ) => rows ? this :
							this._insert( f.toSaveObject( this ) ).then( ( rows ) => this ) )
				} );
	}

	//
	//	Insert this model into the database. The provided data hash should have keys
	//	corresponding to field names and should exclude the ID field.
	//
	_insert( data ) {
		return 	cache.fields( this.constructor.name )
				.then( ( f ) =>
					db( this.table )
					.insert( data )
				);
	}

	//
	//	Update this model in the database. The provided data hash should have keys
	//	corresponding to field names and should exclude the ID field.
	//
	_update( data ) {
		return 	cache.fields( this.constructor.name )
			.then( ( f ) =>
				db( this.table )
					.where( { [f.primaryKey]: data[f.primaryKey] } )
					.update( data )
					.then( ( rows ) => rows )
			);
	}

	//
	//	Set the validations that should be applied to this type's members on save/create
	//
	static set validates( validations ) {
		cache.validations( this.name, validations );
	}

	//
	//	Create a model object and save it to the database. Returns a promise object.
	//
	static create( data ) {
		let obj = new ( this )();
		for( var key in data ) {
			if( data.hasOwnProperty( key ) ) {
				obj[key] = data[key];
			}
		}
		return obj.save;
	}

	//
	//	Override the default mapping between an object property name and a table field name. Usually, fossil
	//	will generate an object property name based on table field names read directly from the database. If
	//	you would prefer to create a different property name from the default, you can use this method.
	//
	static map( property, field ) {
		if( this.name == "Model" ) {
			throw "Cannot invoke method directly on Model class";
		}
		cache.mappings( this.name ).set( field, property );
	}

	//
	//	Retrieve the first model stored in the database. This is typically the model with the lowest
	//	primary key ID
	//
	static get first() {
		return Model._query( 	db( namer.toTableName( this.name ) )
									.select( '*' )
									.limit( 1 ),
									this )
									.then( ( models ) => models.length ? models[0] : undefined );
	}

	//
	//	Get all instances of this model stored in the database
	//
	static get all() {
		return Model._query( 	db( namer.toTableName( this.name ) ).select( '*' ),
		    					this );
	}

	//
	//	Find all records matching the given query. Returns a promise object that resolves to
	//	a list of objects of the calling class' type
	//
	static where( query, options ) {
		let select = db( namer.toTableName( this.name ) )
						.select( '*' )
						.where( query );

		if( options != undefined ) {
			if( options.hasOwnProperty( "limit" ) && typeof options.limit == 'number' ) {
				select = select.limit( options.limit );
			}
			if( options.hasOwnProperty( "offset" ) && typeof options.limit == 'offset' ) {
				select = select.offset( options.offset );
			}
		}

		return Model._query( select, this );
	}

	//
	//      Find the record with the given ID or properties. If ID is a number,
	//      the record with the given unique ID will be found, otherwise if ID
	//      is an object mapping fields to values, the record with the given field
	//      values will be found. Returns a Promise object.
	//
	static find( query ) {
		return cache.fields( this.name )
		    .then( ( fields ) => {
			    if( typeof query == 'number' ) {
				    query = { [fields.primaryKey]: query };
			    }

			    return Model._query( 	db( cache.table( this.name ) )
											.select( '*' )
											.where( query )
											.limit( 1 ),
											this )
					.then( ( models ) => models.length ? models[0] : undefined );
		    } );
	}

	//
	//	Given a basic instantiated model object, attach function properties to the object that
	//	return promises that will resolve to objects of the related model types.
	//
	static attachRelationships( model, obj ) {
		let r = cache.relationships( model.name );

		r.belongsTo.forEach( ( belongs, index, array ) => {
			Object.defineProperty( obj, namer.toMemberName( belongs.name ), {
				get: function () {
					return belongs.find( obj[namer.toForeignKeyID( belongs.name )] )
						// Replace the property with a resolved promise containing the result
						.then( ( parent ) => {
							Object.defineProperty( 	obj,
							    			namer.toMemberName( belongs.name ),
							    			Promise.resolve( parent ) );
							return parent;
						} );
				}
			} );
		} );

		r.hasMany.forEach( ( has, index, array ) => {
			Object.defineProperty( obj, namer.plural( namer.toMemberName( has.name ) ), {
				get: function () {
					return has.find( { [namer.toForeignKeyID( model.name )]: obj.id } )
						// Replace the property with a resolved promise containing the result
						.then( ( children ) => {
							Object.defineProperty( 	obj,
							    namer.plural( namer.toMemberName( has.name ) ),
							    Promise.resolve( children ) );
							return children;
						} );
				}
			} );
		} );

		return obj;
	}

	//
	//	Convert a single row from a result set into an initialized model of the specified type
	//
	static toObject( row, model, fields ) {
		return Model.attachRelationships( model, fields.assign( row, new model() ) );
	}

	//
	//	Given a query object formed in another function and a target model name, generate a promise that
	//	will resolve with a list of model objects
	//
	static _query( q, model ) {
		if( model == "Model" ) {
			throw "Cannot invoke method directly on Model class";
		}

		return cache.fields( model.name )
		    .then( ( fields ) => q.then( ( rows ) => rows.map( ( row, index, array ) => Model.toObject( row, model, fields ) ) ) );
	}

	//
	//	Define a 1-N relationship between this model and another. When selected, models of this type will
	//	have N child objects of the given type selected as well.
	//
	static hasMany( model ) {
		if( this.name == "Model" ) {
			throw "Cannot invoke method directly on Model class";
		}

		cache.relationships( this.name ).addHasMany( model );
	}

	//
	//	Define a 1-1 relationship between this model and a parent model. When selected, models of this type will
	//	have a parent object of the given type selected as well.
	//
	static belongsTo( model ) {
		if( this.name == "Model" ) {
			throw "Cannot invoke method directly on Model class";
		}

		cache.relationships( this.name ).addBelongsTo( model );
	}

	//
	//	Configure the Model type, this will create a database connection and
	//	initialize various internal systems.
	//
	static initialize( config ) {
		db 		= knex( config );
		cache 	= require( "./cache" )( db, require( "./database" )( config.client, db ) );
	}
}

module.exports = Model;