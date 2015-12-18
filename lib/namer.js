"use strict";

var special = {
	"person": 	"people",
	"user": 	"users",
	"mouse": 	"mice"
};

module.exports = {


	//
	//	Convert a model class name to a database table name
	//
	toTableName: function( name ) {
		return this.plural( this.underscore( name ) );
	},

	//
	//	Convert a database table name to a model class name
	//
	toModelName: function( name ) {
		return this.singular( this.camel( name ) );
	},

	//
	//	Convert a member name to database field name style
	//
	toFieldName: function( name ) {
		return this.underscore( name );
	},

	//
	//	Convert a database field name to member name style
	//
	toMemberName: function( name ) {
		return this.camel( name )
			.replace( /^([A-Z])/, ( $1 ) => { return $1.toLowerCase() } );
	},

	//
	//	Given a Model name, generate the expected name for the foreign key representing
	//	that model's ID. Example: ExampleModel -> example_model_id
	//
	toForeignKeyID: function( name ) {
		return this.underscore( name ) + "_id";
	},

	//
	//	Convert a camel-case name to underscore-separation style
	//
	underscore: function( name ) {
		return name
			.replace( /\s([A-Za-z])/, ( $1 ) => { return "_" + $1.toLowerCase() } )
			.replace( /\s/, "" )
			.replace( /^([A-Z])/, ( $1 ) => { return $1.toLowerCase() } )
			.replace( /([A-Z])/, ( $1 ) => { return "_" + $1.toLowerCase() } );
	},

	//
	//	Convert an underscore-separated name to camel case
	//
	camel: function( name ) {
		return name
			.toLowerCase()
			.replace( /\s(.)/, ( $1 ) => { return $1.toUpperCase() } )
			.replace( /\s/, "" )
			.replace( /(_.)/g, ( $1 ) => { return $1.substr( 1 ).toUpperCase() } )
			.replace( /^(.)/, ( $1 ) => { return $1.toUpperCase() } );
	},

	//
	//	Convert the given name into its plural form
	//
	plural: function( name ) {
		if( name in special ) {
			return this.preserveCase( special[name], name );
		}

		if( name.endsWith( "s" ) ) {
			return name + "es";
		} else if( name.endsWith( "y" ) ) {
			return name.slice( 0, -1 ) + "ies";
		} else {
			return name + "s";
		}
	},

	//
	//	Convert the given name into its singular form
	//
	singular: function( name ) {
		for( var key in special ) {
			if( name.toLowerCase() == special[key] ) {
				return this.preserveCase( key, name );
			}
		}

		if( name.endsWith( "es" ) ) {
			return name.substr( 0, name.length - 2 );
		} else if( name.endsWith( "ies" ) ) {
			return name.substr( 0, name.length - 3 ) + "y";
		} else {
			return name.substr( 0, name.length - 1 );
		}
	}
}