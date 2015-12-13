var mockDB 	= require("mock-knex");
var Fossil	= require("../fossil");
var Model 	= Fossil({ client: 'sqlite' } );

mockDB.mock(db);

mockDB.unmock(db);