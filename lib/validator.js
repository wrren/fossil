function stringToValidationFunction( descriptor ) {
	switch( descriptor ) {
		case "int": return function( value ) {
			if( !Number.isInteger( value ) ) {
				throw ( value + " is not an integer" );
			}
		};
		case "float": return function( value ) {
			if( !( value === Number( value ) && value % 1 !== 0 ) ) {
				throw ( value + " is not a floating-point value" );
			}
		};
		case "string": return function( value ) {
			if( !String.isString( value ) ) {
				throw ( value + " is not a string" );
			}
		}
	}
}

function objectToValidationFunction( descriptor ) {
	if( descriptor == Number( descriptor ) ) {
		return function( v ) {
			if( v != descriptor ) {
				throw ( v + " not equal to " + descriptor );
			}
		};
	} else if( String.isString( descriptor ) ) {
		return function( v ) {
			if( v != descriptor ) {
				throw ( v + " does not match " + descriptor );
			}
		};
	}



	if( 'length' in descriptor ) {
		var compFunc = objectToValidationFunction( descriptor.length );
		return function( v ) {
			try {
				if( Array.isArray( v ) ) {

				}
			} catch( e ) {
				throw "Invalid array length: " + v.length;
			}
		};
	} else if( 'less' in descriptor ) {

	} else if( 'lessOrEqual' in descriptor ) {

	} else if( 'is' in descriptor ) {

	} else if( 'greater' in descriptor ) {

	} else if( 'greaterOrEqual' in descriptor ) {

	}
}

//
//	Given a single validation descriptor, generate and return a validation function
//
function toValidationFunction( descriptor ) {
	if( String.isString( descriptor ) ) {
		return stringToValidationFunction( descriptor );
	} else if( Object.isObject( descriptor ) ) {
		return objectToValidationFunction( descriptor );
	}
}

module.exports = {
	//
	//	Given an object associating keys ( corresponding to target Model properties ) to single or multiple
	//	validation descriptors, generate an object that associates those same keys with lists of validation functions
	//	for faster validation.
	//
	generate: function( validations ) {
		generated = {};

		for( var key in validations ) {
			if( !validations.hasOwnProperty( key ) ) {
				continue;
			}

			if( Array.isArray( validations[key] ) ) {
				generated[key] = validations[key].map( ( value, index, array ) => toValidationFunction( value ) );
			} else {
				generated[key] = [ toValidationFunction( validations[key] ) ];
			}
		}

		return generated;
	},

	//
	//	Given an object to validated and an object associating property names to validation functions, attempt
	//	to validate the members of the given object. If validation fails, an exception will be thrown detailing
	//	the validation failured encountered
	//
	validate: function( obj, validations ) {
		failures = [];

		for( var key in obj ) {
			if( !obj.hasOwnProperty( key ) || !validations.hasOwnProperty( key ) ) {
				continue;
			}

			try {
				validations[key]( obj[key] );
			} catch( failure ) {
				failures.push( failure );
			}
		}
	}
};