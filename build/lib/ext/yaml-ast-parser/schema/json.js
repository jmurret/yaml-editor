"use strict";
// Standard YAML's JSON schema.
// http://www.yaml.org/spec/1.2/spec.html#id2803231
//
// NOTE: JS-YAML does not support schema-specific tag resolution restrictions.
// So, this schema is not such strict as defined in the YAML specification.
// It allows numbers in binary notaion, use `Null` and `NULL` as `null`, etc.
Object.defineProperty(exports, "__esModule", { value: true });
var schema_1 = require("../schema");
var failsafe_1 = require("./failsafe");
var null_1 = require("../type/null");
var bool_1 = require("../type/bool");
var int_1 = require("../type/int");
var float_1 = require("../type/float");
exports.default = new schema_1.Schema({
    include: [
        failsafe_1.default
    ],
    implicit: [
        null_1.default,
        bool_1.default,
        int_1.default,
        float_1.default
    ]
});
//# sourceMappingURL=json.js.map