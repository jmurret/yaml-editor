"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var jsonSchemaService_1 = require("./services/jsonSchemaService");
var documentSymbols_1 = require("./services/documentSymbols");
var yamlCompletion_1 = require("./services/yamlCompletion");
var yamlHover_1 = require("./services/yamlHover");
var yamlValidation_1 = require("./services/yamlValidation");
var yamlFormatter_1 = require("./services/yamlFormatter");
var yamlParser_1 = require("./parser/yamlParser");
function getLanguageService(schemaRequestService, workspaceContext, contributions, customSchemaProvider, promiseConstructor) {
    var promise = promiseConstructor || Promise;
    var schemaService = new jsonSchemaService_1.JSONSchemaService(schemaRequestService, workspaceContext, customSchemaProvider);
    var completer = new yamlCompletion_1.YAMLCompletion(schemaService, contributions, promise);
    var hover = new yamlHover_1.YAMLHover(schemaService, contributions, promise);
    var yamlDocumentSymbols = new documentSymbols_1.YAMLDocumentSymbols();
    var yamlValidation = new yamlValidation_1.YAMLValidation(schemaService, promise);
    return {
        configure: function (settings) {
            schemaService.clearExternalSchemas();
            if (settings.schemas) {
                settings.schemas.forEach(function (settings) {
                    schemaService.registerExternalSchema(settings.uri, settings.fileMatch, settings.schema);
                });
            }
            yamlValidation.configure(settings);
            var customTagsSetting = settings && settings["customTags"] ? settings["customTags"] : [];
            completer.configure(customTagsSetting);
        },
        doComplete: completer.doComplete.bind(completer),
        doResolve: completer.doResolve.bind(completer),
        doValidation: yamlValidation.doValidation.bind(yamlValidation),
        doHover: hover.doHover.bind(hover),
        findDocumentSymbols: yamlDocumentSymbols.findDocumentSymbols.bind(yamlDocumentSymbols),
        resetSchema: function (uri) { return schemaService.onResourceChange(uri); },
        doFormat: yamlFormatter_1.format,
        parseYAMLDocument: function (document) { return yamlParser_1.parse(document.getText()); }
    };
}
exports.getLanguageService = getLanguageService;
//# sourceMappingURL=yamlLanguageService.js.map