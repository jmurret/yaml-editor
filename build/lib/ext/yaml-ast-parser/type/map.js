"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var type_1 = require("../type");
exports.default = new type_1.Type('tag:yaml.org,2002:map', {
    kind: 'mapping',
    construct: function (data) { return null !== data ? data : {}; }
});
//# sourceMappingURL=map.js.map