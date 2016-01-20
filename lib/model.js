"use strict";

var knex 			= require( "knex" );
var namer 			= require( "./namer" );
var validator		= require( "./validator" );

var cache			= null;
var db         		= null;

//
//	Given a basic instantiated model object, attach function properties to the object that
//	return promises that will resolve to objects of the related model types.
//
function attachRelationships( model, obj ) {
	let r = cache.relationships( model.name );


}

//
//	Execute a query against the database table corresponding to the given model type.
//
function query( model, q, options ) {
	if( model.name == "Model" ) {
		throw "Cannot invoke method directly on Model class";
	}

	if( options != undefined ) {
		if( options.hasOwnProperty( "limit" ) && typeof options.limit == "number" ) {
			q = q.limit( options.limit );
		}
		if( options.hasOwnProperty( "offset" ) && typeof options.limit == "offset" ) {
			q = q.offset( options.offset );
		}
	}

	return 	cache.fields( model.name )
			.then( ( fields ) => q.then( ( rows ) => rows.map( ( row, index, array ) => {
				let obj = fields.assign( row, new model() );

				if( options != undefined && "lazy" in options && options["lazy"] == true ) {
					return obj;
				}
				return cache.relationships( model.name ).attach( obj, fields );
			} )));
}

//
//	Makes an update query for the specified model type against the specified table name, inserting
//	data from the provided data object that maps table field names to object member data. Returns a
//	promise that resolves to the number of rows affected by the update
//
function update( model, data ) {
	return 	cache.fields( model )
			.then( ( f ) =>
				db( cache.table( model ) )
					.where( { [f.primaryKey]: data[f.primaryKey] } )
					.update( data )
					.then( ( rows ) => rows )
			);
}

//
//	Makes an insert query for the specified model type against the specified table name, inserting
//	data from the provided data object that maps table field names to object member data. Returns a
//	promise that resolves to the number of rows affected by the update
//
function insert( model, data ) {
	return 	cache.fields( model ).then( ( f ) => db( cache.table( model ) ).insert( data ) );
}


class Model {
	constructor() {
		if( this.constructor.name == Model ) {
			throw "Model cannot be constructed directly";
		}

		this._table = cache.table( this.constructor.name );
	}

	//
	//      Get the name of the table in which this model is stored
	//
	static get table() {
		return cache.table( this.name );
	}

	//
	//      Set the name of the table in which this model is stored
	//
	static set table( val ) {
		cache.table( this.name, val );
	}

	//
	//	Save the model's current state to the database
	//
	save() {
		let model = this.constructor.name;

		return cache.fields( model )
				.then( ( f ) => {
					validator.validate( this, cache.validations( model ) );
					return update( model, f.toSaveObject( this ) )
						.then( ( rows ) => rows ? this :
							insert( model, f.toSaveObject( this ) ).then( ( rows ) => this ) )
				} );
	}

	//
	//	Set the validations that should be applied to this type's members on save/create
	//
	static set validations( validations ) {
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
		return obj.save();
	}

	//
	//	Override the default mapping between an object property name and a table field name. Usually, fossil
	//	will generate an object property name based on table field names read directly from the database. If
	//	you would prefer to create a different property name from the default, you can use this method.
	//
	//	This function also accepts a single argument in the form of an object mapping member names to database
	//	fields, in the case when you want to create many mappings in one function call.
	//
	static map( property, field ) {
		if( this.name == "Model" ) {
			throw "Cannot invoke method directly on Model class";
		}

		if( field != undefined ) {
			cache.mappings( this.name ).set( field, property );
		} else if( typeof property == "object" ) {
			for( var key in property ) {
				if( property.hasOwnProperty( key ) ) {
					this.map( key, property[key] );
				}
			}
		}
	}

	//
	//	Retrieve the first model stored in the database. This is typically the model with the lowest
	//	primary key ID
	//
	static first() {
		return query( 	this,
						db( namer.toTableName( this.name ) )
						.select( '*' )
						.limit( 1 ) )
			.then( ( models ) => models.length ? models[0] : undefined );
	}

	//
	//	Get all instances of this model stored in the database
	//
	static all() {
		return query( this, db( cache.table( this.name ) ).select( '*' ) );
	}

	//
	//	Find all records matching the given query. Returns a promise object that resolves to
	//	a list of objects of the calling class' type
	//
	static where( clause, args, options ) {
		return cache.fields( this.name )
			.then( ( fields ) => {
				let q = db( cache.table( this.name ) ).select( '*' );

				if( typeof clause == 'number' ) {
					q = q.where( fields.primaryKey, clause );
					options = args == undefined ? options : args;
				} else if( typeof clause == 'string' ) {
					q = q.whereRaw( clause, args );
				} else if( typeof clause == 'object' ) {
					q = q.where( fields.toFindObject( clause ) );
					options = args == undefined ? options : args;
				}

				return query( this, q, options );
			} );

	}

	//
	//  Find the record that matches the given query. Returns a promise object that resolves
	//	to a single located model or null if no such model could be found.
	//
	static find( clause, args, options ) {
		return cache.fields( this.name )
		    .then( ( fields ) => {
				let q = db( cache.table( this.name ) ).select( '*' );

			    if( typeof clause == 'number' ) {
					q = q.where( fields.primaryKey, clause );
					options = args == undefined ? options : args;
				} else if( typeof clause == 'string' ) {
					q = q.whereRaw( clause, args );
				} else if( typeof clause == 'object' ) {
					q = q.where( fields.toFindObject( clause ) );
					options = args == undefined ? options : args;
				}

			    return query( this, q.limit( 1 ), options )
					.then( ( models ) => models.length ? models[0] : null );
		    } );
	}

	//
	//	Define a 1-N relationship between this model and another. When selected, models of this type will
	//	have N child objects of the given type selected as well. Options is an object that may contain the
	//	following keys:
	//
	//	key: Specifies the key in the child model that contains the ID of the parent model. Defaults to parent_model_name_id
	//
	// 	lazy: Boolean, if true (default) child models will be fetched when their property is accessed only, rather than
	//	being retrieved at the same time as the parent model. Lazy fields are accessors that resolve to promises resolving
	//	to a list of the model's children. If false, the child models will be joined at parent retrieval time and the
	//	child property accessor will immediately return a list of children rather than a promise.
	//
	//	member: Defines the member name that the child accessor property will be given. Defaults to childModelNames
	//
	static hasMany( model, options ) {
		if( this.name == "Model" ) {
			throw "Cannot invoke method directly on Model class";
		}

		cache.relationships( this.name ).addHasMany( model, options );
	}

	//
	//	Define a 1-1 relationship between this model and another. When selected, models of this type will
	//	have a object of the given type selected as well. Options is an object that may contain the
	//	following keys:
	//
	//	key: Specifies the key in the child model that contains the ID of the parent model. Defaults to parent_model_name_id
	//
	// 	lazy: Boolean, if true (default) child models will be fetched when their property is accessed only, rather than
	//	being retrieved at the same time as the parent model. Lazy fields are accessors that resolve to promises resolving
	//	to a list of the model's children. If false, the child models will be joined at parent retrieval time and the
	//	child property accessor will immediately return a list of children rather than a promise.
	//
	//	member: Defines the member name that the child accessor property will be given. Defaults to childModelNames
	//
	static hasOne( model, options ) {
		if( this.name == "Model" ) {
			throw "Cannot invoke method directly on Model class";
		}

	}

	//
	//	Define a 1-1 relationship between this model and a parent model. When selected, models of this type will
	//	have a parent object of the given type selected as well. Options is an object that may contain the
	//	following keys:
	//
	//	key: Specifies the key in the child model that contains the ID of the parent model. Defaults to parent_model_name_id
	//
	// 	lazy: Boolean, if true (default) parent models will be fetched when their property is accessed only, rather than
	//	being retrieved at the same time as the child model. Lazy fields are accessors that resolve to promises resolving
	//	to a parent model object. If false, the parent model will be joined at child retrieval time and the
	//	parent property accessor will immediately return a parent model object rather than a promise.
	//
	//	member: Defines the name that the parent accessor property will be given. Defaults to parentModelName
	//
	static belongsTo( model, options ) {
		if( this.name == "Model" ) {
			throw "Cannot invoke method directly on Model class";
		}

		cache.relationships( this.name ).addBelongsTo( model, options );
	}
}

module.exports = function( config ) {
	db 		= knex( config );
	cache 	= require( "./cache" )( db, require( "./database" )( config, db ) );
	return Model;
}