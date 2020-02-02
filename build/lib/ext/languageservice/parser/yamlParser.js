/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Copyright (c) Adam Voss. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var jsonParser_1 = require("./jsonParser");
var nls = require("vscode-nls");
var localize = nls.loadMessageBundle();
var Yaml = require("../../yaml-ast-parser/index");
var js_yaml_1 = require("js-yaml");
var documentPositionCalculator_1 = require("../utils/documentPositionCalculator");
var SingleYAMLDocument = /** @class */ (function (_super) {
    __extends(SingleYAMLDocument, _super);
    function SingleYAMLDocument(lines) {
        var _this = _super.call(this, null, []) || this;
        _this.getNodeByIndent = function (lines, offset, node) {
            var _a = documentPositionCalculator_1.getPosition(offset, _this.lines), line = _a.line, indent = _a.column;
            var children = node.getChildNodes();
            function findNode(children) {
                for (var idx = 0; idx < children.length; idx++) {
                    var child = children[idx];
                    var _a = documentPositionCalculator_1.getPosition(child.start, lines), childLine = _a.line, childCol = _a.column;
                    if (childCol > indent) {
                        return null;
                    }
                    var newChildren = child.getChildNodes();
                    var foundNode = findNode(newChildren);
                    if (foundNode) {
                        return foundNode;
                    }
                    // We have the right indentation, need to return based on line
                    if (childLine == line) {
                        return child;
                    }
                    if (childLine > line) {
                        // Get previous
                        (idx - 1) >= 0 ? children[idx - 1] : child;
                    }
                    // Else continue loop to try next element
                }
                // Special case, we found the correct
                return children[children.length - 1];
            }
            return findNode(children) || node;
        };
        _this.lines = lines;
        _this.root = null;
        _this.errors = [];
        _this.warnings = [];
        return _this;
    }
    SingleYAMLDocument.prototype.getSchemas = function (schema, doc, node) {
        var matchingSchemas = [];
        doc.validate(schema, matchingSchemas, node.start);
        return matchingSchemas;
    };
    SingleYAMLDocument.prototype.getNodeFromOffset = function (offset) {
        return this.getNodeFromOffsetEndInclusive(offset);
    };
    return SingleYAMLDocument;
}(jsonParser_1.JSONDocument));
exports.SingleYAMLDocument = SingleYAMLDocument;
function recursivelyBuildAst(parent, node) {
    if (!node) {
        return;
    }
    switch (node.kind) {
        case Yaml.Kind.MAP: {
            var instance = node;
            var result = new jsonParser_1.ObjectASTNode(parent, null, node.startPosition, node.endPosition);
            result.addProperty;
            for (var _i = 0, _a = instance.mappings; _i < _a.length; _i++) {
                var mapping = _a[_i];
                result.addProperty(recursivelyBuildAst(result, mapping));
            }
            return result;
        }
        case Yaml.Kind.MAPPING: {
            var instance = node;
            var key = instance.key;
            // Technically, this is an arbitrary node in YAML
            // I doubt we would get a better string representation by parsing it
            var keyNode = new jsonParser_1.StringASTNode(null, null, true, key.startPosition, key.endPosition);
            keyNode.value = key.value;
            var result = new jsonParser_1.PropertyASTNode(parent, keyNode);
            result.end = instance.endPosition;
            var valueNode = (instance.value) ? recursivelyBuildAst(result, instance.value) : new jsonParser_1.NullASTNode(parent, key.value, instance.endPosition, instance.endPosition);
            valueNode.location = key.value;
            result.setValue(valueNode);
            return result;
        }
        case Yaml.Kind.SEQ: {
            var instance = node;
            var result = new jsonParser_1.ArrayASTNode(parent, null, instance.startPosition, instance.endPosition);
            var count = 0;
            for (var _b = 0, _c = instance.items; _b < _c.length; _b++) {
                var item = _c[_b];
                if (item === null && count === instance.items.length - 1) {
                    break;
                }
                // Be aware of https://github.com/nodeca/js-yaml/issues/321
                // Cannot simply work around it here because we need to know if we are in Flow or Block
                var itemNode = (item === null) ? new jsonParser_1.NullASTNode(parent, null, instance.endPosition, instance.endPosition) : recursivelyBuildAst(result, item);
                itemNode.location = count++;
                result.addItem(itemNode);
            }
            return result;
        }
        case Yaml.Kind.SCALAR: {
            var instance = node;
            var type = Yaml.determineScalarType(instance);
            // The name is set either by the sequence or the mapping case.
            var name_1 = null;
            var value = instance.value;
            //This is a patch for redirecting values with these strings to be boolean nodes because its not supported in the parser.
            var possibleBooleanValues = ['y', 'Y', 'yes', 'Yes', 'YES', 'n', 'N', 'no', 'No', 'NO', 'on', 'On', 'ON', 'off', 'Off', 'OFF'];
            if (possibleBooleanValues.indexOf(value.toString()) !== -1) {
                return new jsonParser_1.BooleanASTNode(parent, name_1, value, node.startPosition, node.endPosition);
            }
            switch (type) {
                case Yaml.ScalarType.null: {
                    return new jsonParser_1.StringASTNode(parent, name_1, false, instance.startPosition, instance.endPosition);
                }
                case Yaml.ScalarType.bool: {
                    return new jsonParser_1.BooleanASTNode(parent, name_1, Yaml.parseYamlBoolean(value), node.startPosition, node.endPosition);
                }
                case Yaml.ScalarType.int: {
                    var result = new jsonParser_1.NumberASTNode(parent, name_1, node.startPosition, node.endPosition);
                    result.value = Yaml.parseYamlInteger(value);
                    result.isInteger = true;
                    return result;
                }
                case Yaml.ScalarType.float: {
                    var result = new jsonParser_1.NumberASTNode(parent, name_1, node.startPosition, node.endPosition);
                    result.value = Yaml.parseYamlFloat(value);
                    result.isInteger = false;
                    return result;
                }
                case Yaml.ScalarType.string: {
                    var result = new jsonParser_1.StringASTNode(parent, name_1, false, node.startPosition, node.endPosition);
                    result.value = node.value;
                    return result;
                }
            }
            break;
        }
        case Yaml.Kind.ANCHOR_REF: {
            var instance = node.value;
            return recursivelyBuildAst(parent, instance) ||
                new jsonParser_1.NullASTNode(parent, null, node.startPosition, node.endPosition);
        }
        case Yaml.Kind.INCLUDE_REF: {
            var result = new jsonParser_1.StringASTNode(parent, null, false, node.startPosition, node.endPosition);
            result.value = node.value;
            return result;
        }
    }
}
function convertError(e) {
    return { message: "" + e.reason, location: { start: e.mark.position, end: e.mark.position + e.mark.column, code: jsonParser_1.ErrorCode.Undefined } };
}
function createJSONDocument(yamlDoc, startPositions, text) {
    var _doc = new SingleYAMLDocument(startPositions);
    _doc.root = recursivelyBuildAst(null, yamlDoc);
    if (!_doc.root) {
        // TODO: When this is true, consider not pushing the other errors.
        _doc.errors.push({ message: localize('Invalid symbol', 'Expected a YAML object, array or literal'), code: jsonParser_1.ErrorCode.Undefined, location: { start: yamlDoc.startPosition, end: yamlDoc.endPosition } });
    }
    var duplicateKeyReason = 'duplicate key';
    //Patch ontop of yaml-ast-parser to disable duplicate key message on merge key
    var isDuplicateAndNotMergeKey = function (error, yamlText) {
        var errorConverted = convertError(error);
        var errorStart = errorConverted.location.start;
        var errorEnd = errorConverted.location.end;
        if (error.reason === duplicateKeyReason && yamlText.substring(errorStart, errorEnd).startsWith("<<")) {
            return false;
        }
        return true;
    };
    var errors = yamlDoc.errors.filter(function (e) { return e.reason !== duplicateKeyReason && !e.isWarning; }).map(function (e) { return convertError(e); });
    var warnings = yamlDoc.errors.filter(function (e) { return (e.reason === duplicateKeyReason && isDuplicateAndNotMergeKey(e, text)) || e.isWarning; }).map(function (e) { return convertError(e); });
    errors.forEach(function (e) { return _doc.errors.push(e); });
    warnings.forEach(function (e) { return _doc.warnings.push(e); });
    return _doc;
}
var YAMLDocument = /** @class */ (function () {
    function YAMLDocument(documents) {
        this.documents = documents;
        this.errors = [];
        this.warnings = [];
    }
    return YAMLDocument;
}());
exports.YAMLDocument = YAMLDocument;
function parse(text, customTags) {
    if (customTags === void 0) { customTags = []; }
    var startPositions = documentPositionCalculator_1.getLineStartPositions(text);
    // This is documented to return a YAMLNode even though the
    // typing only returns a YAMLDocument
    var yamlDocs = [];
    var schemaWithAdditionalTags = js_yaml_1.Schema.create(customTags.map(function (tag) {
        var typeInfo = tag.split(' ');
        return new js_yaml_1.Type(typeInfo[0], { kind: typeInfo[1] || 'scalar' });
    }));
    //We need compiledTypeMap to be available from schemaWithAdditionalTags before we add the new custom properties
    customTags.map(function (tag) {
        var typeInfo = tag.split(' ');
        schemaWithAdditionalTags.compiledTypeMap[typeInfo[0]] = new js_yaml_1.Type(typeInfo[0], { kind: typeInfo[1] || 'scalar' });
    });
    var additionalOptions = {
        schema: schemaWithAdditionalTags
    };
    Yaml.loadAll(text, function (doc) { return yamlDocs.push(doc); }, additionalOptions);
    return new YAMLDocument(yamlDocs.map(function (doc) { return createJSONDocument(doc, startPositions, text); }));
}
exports.parse = parse;
//# sourceMappingURL=yamlParser.js.map