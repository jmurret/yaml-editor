"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var type_1 = require("../type");
function resolveYamlNull(data) {
    if (null === data) {
        return true;
    }
    var max = data.length;
    return (max === 1 && data === '~') ||
        (max === 4 && (data === 'null' || data === 'Null' || data === 'NULL'));
}
function constructYamlNull() {
    return null;
}
function isNull(object) {
    return null === object;
}
exports.default = new type_1.Type('tag:yaml.org,2002:null', {
    kind: 'scalar',
    resolve: resolveYamlNull,
    construct: constructYamlNull,
    predicate: isNull,
    represent: {
        canonical: function () { return '~'; },
        lowercase: function () { return 'null'; },
        uppercase: function () { return 'NULL'; },
        camelcase: function () { return 'Null'; }
    },
    defaultStyle: 'lowercase'
});
//# sourceMappingURL=null.js.map