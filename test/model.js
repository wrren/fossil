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
ExampleModel.map( 'identifier', 'id' );
ExampleModel.validations = { exampleParentModelId: { presence: true } };

class ExampleParentModel extends Model {}
ExampleParentModel.hasMany( ExampleModel );
ExampleModel.belongsTo( ExampleParentModel );

describe( 'Model', () => {
	after( () => {
		fs.unlinkSync( path.join( __dirname, "test.sqlite" ) );
	} );

	describe( "#all()", () => {
		it( "should find and retrieve all ExampleModel objects", ( done ) => {
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

	describe( "#find()", () => {
		it( "should find and retrieve the ExampleModel object based on query parameters", ( done ) => {
			ExampleModel.find( 1 )
			    .then( ( model ) => {
				    expect( model.identifier ).to.equal( 1 );
				    done();
			    } );
		} );
	} );

	describe( "#first()", () => {
		it( "should find and retrieve the first ExampleModel object stored in the database", ( done ) => {
			ExampleModel.first
				.then( ( model ) => {
					expect( model ).to.not.equal( undefined );
					done();
				} );
		} );
	} );

	describe( "#save()", () => {
		it( "should save a model object to the database", ( done ) => {
			ExampleModel.create( { exampleParentModelId: 1, name: "fourth child" } )
			.then( ( obj ) => {
				ExampleModel.find( { name: "fourth child" } )
					.then( ( model ) => {
						expect( model.identifier ).to.equal( 4 );
						done();
					} );
			} );
		} );

		it( "should throw an exception when saving an invalid object", ( done ) => {
			ExampleModel.create( { name: "bad child" } )
			.then( ( obj ) => {
				throw "Model failed to be invalidated";
			} )
			.catch( ( e ) => {
				done();
			} );
		} );
	} );
} );