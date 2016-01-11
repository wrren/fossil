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

	if( 'matches' in descriptor ) {
		return function( v ) {
			if( !String.isString( v ) ) {
				throw "Value is not a string";
			} else if( !v.match( descriptor.matches ) ) {
				throw "Value does not match regular expression";
			}
		}
	}
	if( 'presence' in descriptor ) {
		if( descriptor.presence ) {
			return function ( v ) {
				if( v == undefined ) {
					throw "Value must be present";
				}
			}
		} else {
			return function ( v ) {
				if( v != undefined ) {
					throw "Value cannot be present";
				}
			}
		}
	}
	if( 'length' in descriptor ) {
		return function( v ) {
			if( !Array.isArray( v ) && !String.isString( v ) ) {
				throw "Value is not an array or string";
			}

			var compFunc = objectToValidationFunction( descriptor.length );

			try {
				compFunc( v.length );
			} catch( e ) {
				throw "Invalid length: " + v.length;
			}
		};
	}
	if( 'maximum' in descriptor ) {
		return function( v ) {
			if( !( v <= descriptor.maximum ) ) {
				throw v + " is greater than the maximum: " + descriptor.maximum;
			}
		}
	}
	if( 'minimum' in descriptor ) {
		return function( v ) {
			if( !( v >= descriptor.minimum ) ) {
				throw v + " is less than the minimum: " + descriptor.minimum;
			}
		}
	}
	if( 'is' in descriptor ) {
		return function( v ) {
			if( v != descriptor.is ) {
				throw v + " is not equal to: " + descriptor.is;
			}
		}
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

		for( var key in validations ) {
			if( !validations.hasOwnProperty( key ) ) {
				continue;
			}

			try {
				validations[key].forEach( ( validator, index, array ) => {
					validator( obj[key] );
				} );
			} catch( failure ) {
				failures.push( key + ": " + failure );
			}
		}
	}
};