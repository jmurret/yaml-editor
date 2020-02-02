"use strict";
// JS-YAML's default schema for `load` function.
// It is not described in the YAML specification.
//
// This schema is based on JS-YAML's default safe schema and includes
// JavaScript-specific types: !!js/undefined, !!js/regexp and !!js/function.
//
// Also this schema is used as default base schema at `Schema.create` function.
Object.defineProperty(exports, "__esModule", { value: true });
var schema_1 = require("../schema");
var default_safe_1 = require("./default_safe");
var undefined_1 = require("../type/js/undefined");
var regexp_1 = require("../type/js/regexp");
var schema = new schema_1.Schema({
    include: [
        default_safe_1.default
    ],
    explicit: [
        undefined_1.default,
        regexp_1.default
    ]
});
schema_1.Schema.DEFAULT = schema;
exports.default = schema;
//# sourceMappingURL=default_full.js.map