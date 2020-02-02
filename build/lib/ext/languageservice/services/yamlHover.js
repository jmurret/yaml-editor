/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var SchemaService = require("./jsonSchemaService");
var vscode_languageserver_types_1 = require("vscode-languageserver-types");
var arrUtils_1 = require("../utils/arrUtils");
var YAMLHover = /** @class */ (function () {
    function YAMLHover(schemaService, contributions, promiseConstructor) {
        if (contributions === void 0) { contributions = []; }
        this.schemaService = schemaService;
        this.contributions = contributions;
        this.promise = promiseConstructor || Promise;
    }
    YAMLHover.prototype.doHover = function (document, position, doc) {
        if (!document) {
            this.promise.resolve(void 0);
        }
        var offset = document.offsetAt(position);
        var currentDoc = arrUtils_1.matchOffsetToDocument(offset, doc);
        if (currentDoc === null) {
            return this.promise.resolve(void 0);
        }
        var currentDocIndex = doc.documents.indexOf(currentDoc);
        var node = currentDoc.getNodeFromOffset(offset);
        if (!node || (node.type === 'object' || node.type === 'array') && offset > node.start + 1 && offset < node.end - 1) {
            return this.promise.resolve(void 0);
        }
        var hoverRangeNode = node;
        // use the property description when hovering over an object key
        if (node.type === 'string') {
            var stringNode = node;
            if (stringNode.isKey) {
                var propertyNode = node.parent;
                node = propertyNode.value;
                if (!node) {
                    return this.promise.resolve(void 0);
                }
            }
        }
        var hoverRange = vscode_languageserver_types_1.Range.create(document.positionAt(hoverRangeNode.start), document.positionAt(hoverRangeNode.end));
        var createHover = function (contents) {
            var result = {
                contents: contents,
                range: hoverRange
            };
            return result;
        };
        var location = node.getPath();
        for (var i = this.contributions.length - 1; i >= 0; i--) {
            var contribution = this.contributions[i];
            var promise = contribution.getInfoContribution(document.uri, location);
            if (promise) {
                return promise.then(function (htmlContent) { return createHover(htmlContent); });
            }
        }
        return this.schemaService.getSchemaForResource(document.uri).then(function (schema) {
            if (schema) {
                var newSchema = schema;
                if (schema.schema && schema.schema.schemaSequence && schema.schema.schemaSequence[currentDocIndex]) {
                    newSchema = new SchemaService.ResolvedSchema(schema.schema.schemaSequence[currentDocIndex]);
                }
                var matchingSchemas = currentDoc.getMatchingSchemas(newSchema.schema, node.start);
                var title_1 = null;
                var markdownDescription_1 = null;
                var markdownEnumValueDescription_1 = null, enumValue_1 = null;
                matchingSchemas.every(function (s) {
                    if (s.node === node && !s.inverted && s.schema) {
                        title_1 = title_1 || s.schema.title;
                        markdownDescription_1 = markdownDescription_1 || s.schema["markdownDescription"] || toMarkdown(s.schema.description);
                        if (s.schema.enum) {
                            var idx = s.schema.enum.indexOf(node.getValue());
                            if (s.schema["markdownEnumDescriptions"]) {
                                markdownEnumValueDescription_1 = s.schema["markdownEnumDescriptions"][idx];
                            }
                            else if (s.schema.enumDescriptions) {
                                markdownEnumValueDescription_1 = toMarkdown(s.schema.enumDescriptions[idx]);
                            }
                            if (markdownEnumValueDescription_1) {
                                enumValue_1 = s.schema.enum[idx];
                                if (typeof enumValue_1 !== 'string') {
                                    enumValue_1 = JSON.stringify(enumValue_1);
                                }
                            }
                        }
                    }
                    return true;
                });
                var result = '';
                if (title_1) {
                    result = toMarkdown(title_1);
                }
                if (markdownDescription_1) {
                    if (result.length > 0) {
                        result += "\n\n";
                    }
                    result += markdownDescription_1;
                }
                if (markdownEnumValueDescription_1) {
                    if (result.length > 0) {
                        result += "\n\n";
                    }
                    result += "`" + toMarkdown(enumValue_1) + "`: " + markdownEnumValueDescription_1;
                }
                return createHover([result]);
            }
            return void 0;
        });
    };
    return YAMLHover;
}());
exports.YAMLHover = YAMLHover;
function toMarkdown(plain) {
    if (plain) {
        var res = plain.replace(/([^\n\r])(\r?\n)([^\n\r])/gm, '$1\n\n$3'); // single new lines to \n\n (Markdown paragraph)
        return res.replace(/[\\`*_{}[\]()#+\-.!]/g, "\\$&"); // escape markdown syntax tokens: http://daringfireball.net/projects/markdown/syntax#backslash
    }
    return void 0;
}
//# sourceMappingURL=yamlHover.js.map