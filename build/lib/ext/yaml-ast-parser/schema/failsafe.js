"use strict";
// Standard YAML's Failsafe schema.
// http://www.yaml.org/spec/1.2/spec.html#id2802346
Object.defineProperty(exports, "__esModule", { value: true });
var schema_1 = require("../schema");
var str_1 = require("../type/str");
var seq_1 = require("../type/seq");
var map_1 = require("../type/map");
exports.default = new schema_1.Schema({
    explicit: [
        str_1.default,
        seq_1.default,
        map_1.default
    ]
});
//# sourceMappingURL=failsafe.js.map