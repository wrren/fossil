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
			.replace( /^([A-Z])/, ( $1 ) => $1.toLowerCase() );
	},

	//
	//	Given a Model name, generate the expected name for the foreign key representing
	//	that model's ID. Example: ExampleModel -> example_model_id
	//
	toForeignKeyID: function( name ) {
		return this.toMemberName( name ) + "Id";
	},

	//
	//	Convert a camel-case name to underscore-separation style
	//
	underscore: function( name ) {
		return name
			.replace( /\s([A-Za-z])/g, 	( $1 ) => "_" + $1.toLowerCase() )
			.replace( /\s/g, "" )
			.replace( /^([A-Z])/, 		( $1 ) => $1.toLowerCase() )
			.replace( /([A-Z])/g, 		( $1 ) => "_" + $1.toLowerCase() );
	},

	//
	//	Convert an underscore-separated name to camel case
	//
	camel: function( name ) {
		return name
		    	.replace( /([A-Z])$/, 		( $1 ) => $1.toLowerCase() )
			.replace( /\s(.)/g, 		( $1 ) => $1.toUpperCase() )
			.replace( /\s/g, "" )
			.replace( /(_.)/g, 		( $1 ) => $1.substr( 1 ).toUpperCase() )
			.replace( /^(.)/, 		( $1 ) => $1.toUpperCase() );
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
	},

	//
	//	Given a new name and the name from which it was transformed, Ensure that
	//	the new name preserves the casing style of the original name.
	//
	preserveCase: function( newName, originalName ) {
		if( originalName.length && newName.length ) {
			if( originalName[0] >= 'A' && originalName[0] <= 'Z' ) {
				return newName.replace( /^([a-z])/, ( $1 ) => $1.toUpperCase() );
			} else if( originalName[0] >= 'a' && originalName[0] <= 'z' ) {
				return newName.replace( /^([A-Z])/, ( $1 ) => $1.toLowerCase() );
			}
		}
		return newName;
	}
}