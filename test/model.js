"use strict";

var fs 		= require( "fs" );
var path 	= require( "path" );
fs.createReadStream( path.join( __dirname, "test.seed.sqlite" ) )
	.pipe( fs.createWriteStream( path.join( __dirname, "test.sqlite" ) ) );

var Model 	= require( "../fossil" )( {
	client: 'sqlite',
	connection: {
		filename: "./test.sqlite"
	}
} );

var expect = require( 'chai' ).expect;

class ExampleModel extends Model {}

describe( 'Model', () => {

} );