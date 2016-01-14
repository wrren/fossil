# fossil

[![NPM version](https://badge.fury.io/js/fossil.svg)](http://badge.fury.io/js/fossil)
[![Build Status](https://travis-ci.org/wrren/fossil.svg)](https://travis-ci.org/wrren/fossil)

ActiveRecord-style persistence system for Node JS projects. Fossil provides a Model base class that may be
used to create your own Model types. Fossil's Model class provides ActiveRecord functions such as ```create```,
```save```, ```find``` and ```where```. Fossil will intelligently link Model types to their corresponding database
table using an ActiveRecord-style naming convention, however you can override both default table and property name
mappings if needed.

Fossil also provides an inbuilt validation system that's invoked when an attempt is made to save a Model object. 
Failed validation will result in an exception being thrown.

## How to Install

```npm install fossil --save```

## How to Use

Fossil uses [knex](http://knexjs.org) to connect to your database. When initializing fossil, you'll need to provide
a knex-style configuration object. Fossil query methods return promises which resolve to the desired results 
or reject if an error occurs.

### Example

```js

var Model = require( "fossil" )( {
    client: 'mysql',
    connection: {
        host     : '127.0.0.1',
        user     : 'your_database_user',
        password : 'your_database_password',
        database : 'myapp_test'
    }
} );

class MyModelClass extends Model
{}

MyModelClass.validations = {    id: [ "int", { minimum: 1 } ],
                                name: [ "string", function( v ) { return v[0] == "."; }, { length: { maximum: 50 } ] };

let first   = MyModelClass.first.then( ( obj ) => // do something with retrieved object );
let second  = MyModelClass.find( { id: 2 } ).then( ( obj ) => // do something with retrieved object );
let all     = MyModelClass.all.then( ( objects ) => // do something with retrieved objects );

let saved   = new MyModelClass;
saved.id    = 0;


saved.save.then( ( obj ) => {
    console.log( "We won't reach this point" );
} ).error( ( failures ) => {
    console.log( "Save will fail due to invalid id field value" );
} );

```

The first time any model is accessed, fossil will read the database and generate a map of tables, columns and column
types. This map is used to generate model objects when queries are executed, so you don't need to defined properties
on your models; these will be populated at query time