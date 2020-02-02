/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var jsonSchemaService_1 = require("./jsonSchemaService");
var vscode_languageserver_types_1 = require("vscode-languageserver-types");
var YAMLValidation = /** @class */ (function () {
    function YAMLValidation(jsonSchemaService, promiseConstructor) {
        this.jsonSchemaService = jsonSchemaService;
        this.promise = promiseConstructor;
        this.validationEnabled = true;
    }
    YAMLValidation.prototype.configure = function (shouldValidate) {
        if (shouldValidate) {
            this.validationEnabled = shouldValidate.validate;
        }
    };
    YAMLValidation.prototype.doValidation = function (textDocument, yamlDocument) {
        if (!this.validationEnabled) {
            return this.promise.resolve([]);
        }
        return this.jsonSchemaService.getSchemaForResource(textDocument.uri).then(function (schema) {
            var diagnostics = [];
            var added = {};
            var newSchema = schema;
            if (schema) {
                var documentIndex = 0;
                for (var currentYAMLDoc in yamlDocument.documents) {
                    var currentDoc = yamlDocument.documents[currentYAMLDoc];
                    if (schema.schema && schema.schema.schemaSequence && schema.schema.schemaSequence[documentIndex]) {
                        newSchema = new jsonSchemaService_1.ResolvedSchema(schema.schema.schemaSequence[documentIndex]);
                    }
                    var diagnostics_1 = currentDoc.getValidationProblems(newSchema.schema);
                    for (var diag in diagnostics_1) {
                        var curDiagnostic = diagnostics_1[diag];
                        currentDoc.errors.push({ location: { start: curDiagnostic.location.start, end: curDiagnostic.location.end }, message: curDiagnostic.message });
                    }
                    documentIndex++;
                }
            }
            if (newSchema && newSchema.errors.length > 0) {
                for (var _i = 0, _a = newSchema.errors; _i < _a.length; _i++) {
                    var curDiagnostic = _a[_i];
                    diagnostics.push({
                        severity: vscode_languageserver_types_1.DiagnosticSeverity.Error,
                        range: {
                            start: {
                                line: 0,
                                character: 0
                            },
                            end: {
                                line: 0,
                                character: 1
                            }
                        },
                        message: curDiagnostic
                    });
                }
            }
            var _loop_1 = function (currentYAMLDoc) {
                var currentDoc = yamlDocument.documents[currentYAMLDoc];
                currentDoc.errors.concat(currentDoc.warnings).forEach(function (error, idx) {
                    // remove duplicated messages
                    var signature = error.location.start + ' ' + error.location.end + ' ' + error.message;
                    if (!added[signature]) {
                        added[signature] = true;
                        var range = {
                            start: textDocument.positionAt(error.location.start),
                            end: textDocument.positionAt(error.location.end)
                        };
                        diagnostics.push({
                            severity: idx >= currentDoc.errors.length ? vscode_languageserver_types_1.DiagnosticSeverity.Warning : vscode_languageserver_types_1.DiagnosticSeverity.Error,
                            range: range,
                            message: error.message
                        });
                    }
                });
            };
            for (var currentYAMLDoc in yamlDocument.documents) {
                _loop_1(currentYAMLDoc);
            }
            return diagnostics;
        });
    };
    return YAMLValidation;
}());
exports.YAMLValidation = YAMLValidation;
//# sourceMappingURL=yamlValidation.js.map