var validator = require( "../lib/validator" );

var expect 	= require( "chai" ).expect;

describe( "validator", () => {
	describe( "#generate()", () => {
		it( "generates a set of validation functions based on a given descriptor object", () => {
			var validations = {
				key1: "int",
				key2: [ "int", { maximum: 10, minimum: 0 } ]
			};

			var generated = validator.generate( validations );

			expect( generated.key1.length ).to.equal( 1 );
			expect( generated.key2.length ).to.equal( 2 );
		} );
	} );

	describe( "#validate()", () => {
		it( "should run without throwing an exception when provided an object with valid members", () => {
			var validations = {
				key1: [ "string", { length: { is: 5 } }, { length: 5 }, { length: { minimum: 4, maximum: 5 } }, { matches: /hello/ } ],
				key2: [ "int", { maximum: 10, minimum: 0 } ]
			};

			var obj = {
				key1: "hello",
				key2: 5
			};

			var fn = function() {
				validator.validate( obj, validator.generate( validations ) );
			}

			expect( fn ).to.not.throw( failures );
		} );

		it( "should thow an exception when provided an object with invalid members", () => {
			var validations = {
				key1: [ "string", { length: { is: 10 } } ],
				key2: [ "int", { maximum: 10, minimum: 0 } ]
			};

			var obj = {
				key1: "hello",
				key2: 500
			};

			var fn = function() {
				validator.validate( obj, validator.generate( validations ) );
			}

			expect( fn ).to.throw( failures );
		} );
	} );
} );