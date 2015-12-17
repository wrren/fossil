var Model 	= require("./lib/model");

function Fossil( config ) {
	Model.config( config );
	return Model;
}

module.exports = Fossil;