"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var type_1 = require("../type");
function resolveYamlMerge(data) {
    return '<<' === data || null === data;
}
exports.default = new type_1.Type('tag:yaml.org,2002:merge', {
    kind: 'scalar',
    resolve: resolveYamlMerge
});
//# sourceMappingURL=merge.js.map