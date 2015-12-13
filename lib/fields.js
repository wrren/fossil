"use strict";

class ModelFields {
        constructor(fields) {
                this._fields            = fields;
                this._primaryKey        = undefined;

                fields.forEach((value, index, array) => {
                        if (value.key == "primary") {
                                this._primaryKey = value.name;
                        }
                });
        }

        get list() {
                return this._fields;
        }

        get primaryKey() {
                return this._primaryKey;
        }
};

module.exports = ModelFields;