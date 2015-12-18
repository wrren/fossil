"use strict";

//
//	Represents the relationships with other model types for a given model
//
class Relationships {
	constructor( model ) {
		this.model 	= model;
		this._hasMany	= [];
		this._belongsTo	= [];
	}

	//
	//	Add a has-many relationship for this model. When retrieving models of the current type,
	//	N model objects of the specified type may be retrieved.
	//
	addHasMany( child ) {
		this._hasMany.push( child );
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
	addBelongsTo( child ) {
		this._belongsTo.push( child );
	}

	//
	//	Get a list of belongs-to relationships for this model
	//
	get belongsTo() {
		return this._belongsTo;
	}
}

module.exports = Relationships;
