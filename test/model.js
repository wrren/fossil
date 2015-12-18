"use strict";

var fs 		= require( "fs" );
var path 	= require( "path" );

fs.createReadStream( path.join( __dirname, "test.seed.sqlite" ) )
	.pipe( fs.createWriteStream( path.join( __dirname, "test.sqlite" ) ) );

var Model 	= require( "../fossil" )( {
	client: 'sqlite',
	connection: {
		filename: path.join( __dirname, "test.sqlite" )
	}
} );

var expect = require( 'chai' ).expect;

class ExampleModel extends Model {}


class ExampleParentModel extends Model {}
ExampleParentModel.hasMany( ExampleModel );
ExampleModel.belongsTo( ExampleParentModel );

describe( 'Model', () => {

	describe( "#find()", () => {
		it( "should find and retrieve an ExampleModel object", ( done ) => {
			ExampleModel.all
				.then( ( results ) => {
					expect( results.length ).to.equal( 3 );
					return results[0].exampleParentModel;
				} )
				.then( ( parent ) => {
					expect( parent.id ).to.equal( 1 );
					done();
				} );
		} );
	} );
} );