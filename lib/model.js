"use strict";

var knex 		= require( "knex" );
var ModelFields 	= require( "./fields" );
var Relationships	= require( "./relationships" );
var namer 		= require( "./namer" );

var db         		= null;
var dbUtils 		= null;
var initializer		= null;
var fields 		= new Map();
var relationships	= new Map();

class Model {
	constructor() {
		if( this.constructor.name == Model ) {
			throw "Model cannot be constructed directly";
		}
		this.table = namer.toTableName( this.constructor.name );
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
	//	Given a basic instantiated model object, attach function properties to the object that
	//	return promises that will resolve to objects of the related model types.
	//
	static attachRelationships( model, obj ) {
		let r = relationships.get( model.name );

		r.belongsTo.forEach( ( belongs, index, array ) => {
			Object.defineProperty( obj, namer.toMemberName( belongs.name ), {
				get: function () {
					return belongs.find( obj[namer.toForeignKeyID( belongs.name )] );
				}
			} );
		} );

		r.hasMany.forEach( ( has, index, array ) => {
			Object.defineProperty( obj, namer.plural( namer.toMemberName( has.name ) ), {
				get: function () {
					return has.find( { [namer.toForeignKeyID( model.name )]: obj.id } );
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

		return this.initialize( namer.toTableName( model.name ) )
		    .then( ( fields ) =>
			q.then( ( rows ) =>
				rows.map( ( row, index, array ) => Model.toObject( row, model, fields ) ) )
		    );
	}

	//
	//	Get all instances of this model stored in the database
	//
	static get all() {
		return Model._query( 	db( namer.toTableName( this.name ) ).select( '*' ),
					    this );
	}

	//
	//      Find the record with the given ID or properties. If ID is a number,
	//      the record with the given unique ID will be found, otherwise if ID
	//      is an object mapping fields to values, the record with the given field
	//      values will be found. Returns a Promise object.
	//
	static find( query ) {
		return this.initialize( namer.toTableName( this.name ) )
			.then( ( fields ) => {
				if( typeof query == 'number' ) {
					query = { [fields.primaryKey]: query };
				}

				return Model._query( 	db( namer.toTableName( this.name ) )
							    .select( '*' )
							    .where( query )
							    .limit( 1 ),
				    			this )
				    .then( ( models ) => models.length ? models[0] : undefined );
			} );
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
	//	Define a 1-N relationship between this model and another. When selected, models of this type will
	//	have N child objects of the given type selected as well.
	//
	static hasMany( model ) {
		if( this.name == "Model" ) {
			throw "Cannot invoke method directly on Model class";
		}

		if( !relationships.has( this.name ) ) {
			relationships.set( this.name, new Relationships( this.name ) );
		}
		relationships.get( this.name ).addHasMany( model );
	}

	//
	//	Define a 1-1 relationship between this model and a parent model. When selected, models of this type will
	//	have a parent object of the given type selected as well.
	//
	static belongsTo( model ) {
		if( this.name == "Model" ) {
			throw "Cannot invoke method directly on Model class";
		}

		if( !relationships.has( this.name ) ) {
			relationships.set( this.name, new Relationships( this.name ) );
		}
		relationships.get( this.name ).addBelongsTo( model );
	}

	//
	//	Get the relationships defined for this model type. Returns a Relationships object.
	//
	static relationships() {
		if( this.name == "Model" ) {
			throw "Cannot invoke method directly on Model class";
		}

		if( !relationships.has( this.name ) ) {
			relationships.set( this.name, new Relationships( this.name ) );
		}
		return relationships.get( this.name );
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
}

module.exports = Model;