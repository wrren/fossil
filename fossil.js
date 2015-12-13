var Knex 	= require("knex");
var Model 	= require("./lib/model");

function Fossil(config) {
	Model.db = new Knex(config);
	return Model;
}

module.exports = Fossil;