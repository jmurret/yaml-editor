"use strict";
// Standard YAML's Core schema.
// http://www.yaml.org/spec/1.2/spec.html#id2804923
//
// NOTE: JS-YAML does not support schema-specific tag resolution restrictions.
// So, Core schema has no distinctions from JSON schema is JS-YAML.
Object.defineProperty(exports, "__esModule", { value: true });
var schema_1 = require("../schema");
var json_1 = require("./json");
exports.default = new schema_1.Schema({
    include: [
        json_1.default
    ]
});
//# sourceMappingURL=core.js.map