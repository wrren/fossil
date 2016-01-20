"use strict";

var namer = require( "./namer" );

//
//	Represents the relationships with other model types for a given model
//
class Relationships {
	constructor( model ) {
		this.model 		= model;
		this._hasMany	= [];
		this._hasOne	= [];
		this._belongsTo	= [];
	}

	//
	//	Add a has-many relationship for this model. When retrieving models of the current type,
	//	N model objects of the specified type may be retrieved.
	//
	addHasMany( child, options ) {
		if( options == undefined ) {
			options = {};
		}
		this._hasMany.push( { child, options } );
	}

	//
	//	Add a has-one relationship for this model. When retrieving models of the current type,
	//	a model object of the specified type may be retrieved.
	//
	addHasOne( sibling, options ) {
		if( options == undefined ) {
			options = {};
		}
		this._hasOne.push( { sibling, options } );
	}

	//
	//	Get a list of the has-one relationships for this model
	//
	get hasOne() {
		return this._hasOne;
	}

	//
	//	Get a list of has-many relationships for this model
	//
	get hasMany() {
		return this._hasMany;
	}

	//
	//	Add a belongs-to relationship for this model. When retrieving models of the current
	//	type, a parent object of the specified type may be retrieved.
	//
	addBelongsTo( parent, options ) {
		if( options == undefined ) {
			options = {};
		}
		this._belongsTo.push( { parent, options } );
	}

	//
	//	Get a list of belongs-to relationships for this model
	//
	get belongsTo() {
		return this._belongsTo;
	}

	//
	//	Given a Model object of the type associated with this Relationships object, attach all of the defined
	//	relationships for this type to the object as accessor properties. Resolves to a Promise object.
	//
	attach( obj, fields ) {
		let belongs = this.belongsTo.map( ( element, index, array ) => {
			let belongs	= element.parent;
			let options	= element.options;
			let key 	= 'key' in options ? options['key'] : namer.toForeignKeyID( belongs.name );
			let lazy	= 'lazy' in options ? options['lazy'] : true;
			let member	= 'member' in options ? options['member'] : namer.toMemberName( belongs.name );

			if( lazy ) {
				Object.defineProperty( obj, member, {
					get: function () {
						return belongs.find( obj[key], { lazy: true } )
							// Replace the property with a resolved promise containing the result
							.then( ( parent ) => {
								Object.defineProperty( obj, member, Promise.resolve( parent ) );
								return parent;
							} );
					}
				} );
				return Promise.resolve();
			} else {
				return belongs.find( obj[key], { lazy: true } )
					.then( ( parent ) => {
						Object.defineProperty( obj, member, {
							get: function() {
								return parent;
							}
						} );
					} );
			}
		} );

		let hasMany = this.hasMany.map( ( element, index, array ) => {
			let belongs	= element.child;
			let options	= element.options;
			let key 	= 'key' in options ? options['key'] : namer.toForeignKeyID( this.model );
			let lazy	= 'lazy' in options ? options['lazy'] : true;
			let member	= 'member' in options ? options['member'] : namer.plural( namer.toMemberName( hasMany.name ) );

			if( lazy ) {
				Object.defineProperty( obj, member, {
					get: function () {
						return hasMany.where( { [key]: obj[fields] }, { lazy: true } )
							// Replace the property with a resolved promise containing the result
							.then( ( children ) => {
								Object.defineProperty( 	obj,
									namer.plural( namer.toMemberName( has.name ) ),
									Promise.resolve( children ) );
								return children;
							} );
					}
				} );
				return Promise.resolve();
			} else {
				return belongs.where( obj[key], { lazy: true } )
					.then( ( children ) => {
						Object.defineProperty( obj, member, {
							get: function() {
								return children;
							}
						} );
					} );
			}
		} );

		let hasOne = this.hasOne.map( ( element, index, array ) => {
			let belongs	= element.sibling;
			let options	= element.options;
			let key 	= 'key' in options ? options['key'] : namer.toForeignKeyID( hasOne.name );
			let lazy	= 'lazy' in options ? options['lazy'] : true;
			let member	= 'member' in options ? options['member'] : namer.toMemberName( hasOne.name );

			if( lazy ) {
				Object.defineProperty( obj, member, {
					get: function () {
						return belongs.find( obj[key], { lazy: true } )
							// Replace the property with a resolved promise containing the result
							.then( ( sibling ) => {
								Object.defineProperty( obj, member, Promise.resolve( sibling ) );
								return sibling;
							} );
					}
				} );
				return Promise.resolve();
			} else {
				return belongs.find( obj[key], { lazy: true } )
					.then( ( sibling ) => {
						Object.defineProperty( obj, member, {
							get: function() {
								return sibling;
							}
						} );
					} );
			}
		} );

		return obj;
	}
}

module.exports = Relationships;
