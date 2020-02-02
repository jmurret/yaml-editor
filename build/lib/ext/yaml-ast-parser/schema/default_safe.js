"use strict";
// JS-YAML's default schema for `safeLoad` function.
// It is not described in the YAML specification.
//
// This schema is based on standard YAML's Core schema and includes most of
// extra types described at YAML tag repository. (http://yaml.org/type/)
Object.defineProperty(exports, "__esModule", { value: true });
var schema_1 = require("../schema");
var core_1 = require("./core");
var timestamp_1 = require("../type/timestamp");
var merge_1 = require("../type/merge");
var binary_1 = require("../type/binary");
var omap_1 = require("../type/omap");
var pairs_1 = require("../type/pairs");
var set_1 = require("../type/set");
exports.default = new schema_1.Schema({
    include: [
        core_1.default
    ],
    implicit: [
        timestamp_1.default,
        merge_1.default
    ],
    explicit: [
        binary_1.default,
        omap_1.default,
        pairs_1.default,
        set_1.default
    ]
});
//# sourceMappingURL=default_safe.js.map