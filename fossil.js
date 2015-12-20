var Model 	= require("./lib/model");

function Fossil( config ) {
	Model.initialize( config );
	return Model;
}

module.exports = Fossil;