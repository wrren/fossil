var namer 	= require( "../lib/namer" );
var expect 	= require( "chai" ).expect;

describe( "namer", () => {
	describe( "#plural()", () => {
		it( "pluralizes a given name", () => {
			expect( namer.plural( "bus" ) ).to.equal( "buses" );
			expect( namer.plural( "umbrella" ) ).to.equal( "umbrellas" );
		} );
	} );

	describe( "#singular()", () => {
		it( "converts the given name to its singular form", () => {
			expect( namer.singular( "buses" ) ).to.equal( "bus" );
			expect( namer.singular( "umbrellas" ) ).to.equal( "umbrella" );
		} );
	} );

	describe( "#camel()", () => {
		it( "converts a given name to camel case", () => {
			expect( namer.camel( "bus" ) ).to.equal( "Bus" );
			expect( namer.camel( "buS" ) ).to.equal( "Bus" );
			expect( namer.camel( "Bus stop" ) ).to.equal( "BusStop" )
			expect( namer.camel( "bus_stop" ) ).to.equal( "BusStop" );
		} );
	} );

	describe( "#underscore()", () => {
		it( "converts a given name to underscore style", () => {
			expect( namer.underscore( "BusStop" ) ).to.equal( "bus_stop" );
			expect( namer.underscore( "Bus Stop" ) ).to.equal( "bus_stop" );
			expect( namer.underscore( "Bus" ) ).to.equal( "bus" );
		} );
	} );
} );