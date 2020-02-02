"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var type_1 = require("../../type");
function resolveJavascriptUndefined() {
    return true;
}
function constructJavascriptUndefined() {
    /*eslint-disable no-undefined*/
    return undefined;
}
function representJavascriptUndefined() {
    return '';
}
function isUndefined(object) {
    return 'undefined' === typeof object;
}
exports.default = new type_1.Type('tag:yaml.org,2002:js/undefined', {
    kind: 'scalar',
    resolve: resolveJavascriptUndefined,
    construct: constructJavascriptUndefined,
    predicate: isUndefined,
    represent: representJavascriptUndefined
});
//# sourceMappingURL=undefined.js.map