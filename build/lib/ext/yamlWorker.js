/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Copyright (c) Adam Voss. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = monaco.Promise;
var ls = require("vscode-languageserver-types");
var yamlService = require("./languageservice/yamlLanguageService");
var PromiseAdapter = /** @class */ (function () {
    function PromiseAdapter(executor) {
        this.wrapped = new monaco.Promise(executor);
    }
    PromiseAdapter.prototype.then = function (onfulfilled, onrejected) {
        var thenable = this.wrapped;
        return thenable.then(onfulfilled, onrejected);
    };
    PromiseAdapter.prototype.getWrapped = function () {
        return this.wrapped;
    };
    PromiseAdapter.prototype.cancel = function () {
        this.wrapped.cancel();
    };
    PromiseAdapter.resolve = function (v) {
        return monaco.Promise.as(v);
    };
    PromiseAdapter.reject = function (v) {
        return monaco.Promise.wrapError(v);
    };
    PromiseAdapter.all = function (values) {
        return monaco.Promise.join(values);
    };
    return PromiseAdapter;
}());
// Currently we only support loading schemas via xhr:
var ajax = function (url) {
    return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
                var response = request.responseText;
                if (request.status < 400) {
                    resolve(response);
                }
                else {
                    reject(response);
                }
            }
        };
        request.onerror = reject;
        request.open('GET', url);
        request.send();
    });
};
var YAMLWorker = /** @class */ (function () {
    function YAMLWorker(ctx, createData) {
        this._ctx = ctx;
        this._languageSettings = createData.languageSettings;
        this._languageId = createData.languageId;
        this._languageService = yamlService.getLanguageService(ajax, null, [], null, PromiseAdapter);
        this._languageService.configure(this._languageSettings);
    }
    YAMLWorker.prototype.doValidation = function (uri) {
        var document = this._getTextDocument(uri);
        if (document) {
            var yamlDocument = this._languageService.parseYAMLDocument(document);
            return this._languageService.doValidation(document, yamlDocument);
        }
        return Promise.as([]);
    };
    YAMLWorker.prototype.doComplete = function (uri, position) {
        var document = this._getTextDocument(uri);
        var completionFix = completionHelper(document, position);
        var yamlDocument = this._languageService.parseYAMLDocument(document);
        return this._languageService.doComplete(document, position, yamlDocument);
    };
    YAMLWorker.prototype.doResolve = function (item) {
        return this._languageService.doResolve(item);
    };
    YAMLWorker.prototype.doHover = function (uri, position) {
        var document = this._getTextDocument(uri);
        var yamlDocument = this._languageService.parseYAMLDocument(document);
        return this._languageService.doHover(document, position, yamlDocument);
    };
    YAMLWorker.prototype.format = function (uri, range, options) {
        var document = this._getTextDocument(uri);
        var textEdits = this._languageService.doFormat(document, options, []);
        return Promise.as(textEdits);
    };
    YAMLWorker.prototype.resetSchema = function (uri) {
        return Promise.as(this._languageService.resetSchema(uri));
    };
    YAMLWorker.prototype.findDocumentSymbols = function (uri) {
        var document = this._getTextDocument(uri);
        var yamlDocument = this._languageService.parseYAMLDocument(document);
        var symbols = this._languageService.findDocumentSymbols(document, yamlDocument);
        return Promise.as(symbols);
    };
    YAMLWorker.prototype._getTextDocument = function (uri) {
        var models = this._ctx.getMirrorModels();
        for (var _i = 0, models_1 = models; _i < models_1.length; _i++) {
            var model = models_1[_i];
            if (model.uri.toString() === uri) {
                return ls.TextDocument.create(uri, this._languageId, model.version, model.getValue());
            }
        }
        return null;
    };
    return YAMLWorker;
}());
exports.YAMLWorker = YAMLWorker;
function create(ctx, createData) {
    return new YAMLWorker(ctx, createData);
}
exports.create = create;
function getLineOffsets(textDocString) {
    var lineOffsets = [];
    var text = textDocString;
    var isLineStart = true;
    for (var i = 0; i < text.length; i++) {
        if (isLineStart) {
            lineOffsets.push(i);
            isLineStart = false;
        }
        var ch = text.charAt(i);
        isLineStart = (ch === '\r' || ch === '\n');
        if (ch === '\r' && i + 1 < text.length && text.charAt(i + 1) === '\n') {
            i++;
        }
    }
    if (isLineStart && text.length > 0) {
        lineOffsets.push(text.length);
    }
    return lineOffsets;
}
exports.getLineOffsets = getLineOffsets;
// https://github.com/redhat-developer/yaml-language-server/blob/5e069c0e9d7004d57f1fa6e93df670d4895883d1/src/server.ts#L453
function completionHelper(document, textDocumentPosition) {
    //Get the string we are looking at via a substring
    var linePos = textDocumentPosition.line;
    var position = textDocumentPosition;
    var lineOffset = getLineOffsets(document.getText());
    var start = lineOffset[linePos]; //Start of where the autocompletion is happening
    var end = 0; //End of where the autocompletion is happening
    if (lineOffset[linePos + 1]) {
        end = lineOffset[linePos + 1];
    }
    else {
        end = document.getText().length;
    }
    var textLine = document.getText().substring(start, end);
    //Check if the string we are looking at is a node
    if (textLine.indexOf(":") === -1) {
        //We need to add the ":" to load the nodes
        var newText = "";
        //This is for the empty line case
        var trimmedText = textLine.trim();
        if (trimmedText.length === 0 || (trimmedText.length === 1 && trimmedText[0] === '-')) {
            //Add a temp node that is in the document but we don't use at all.
            if (lineOffset[linePos + 1]) {
                newText = document.getText().substring(0, start + (textLine.length - 1)) + "holder:\r\n" + document.getText().substr(end + 2);
            }
            else {
                newText = document.getText().substring(0, start + (textLine.length)) + "holder:\r\n" + document.getText().substr(end + 2);
            }
            //For when missing semi colon case
        }
        else {
            //Add a semicolon to the end of the current line so we can validate the node
            if (lineOffset[linePos + 1]) {
                newText = document.getText().substring(0, start + (textLine.length - 1)) + ":\r\n" + document.getText().substr(end + 2);
            }
            else {
                newText = document.getText().substring(0, start + (textLine.length)) + ":\r\n" + document.getText().substr(end + 2);
            }
        }
        return {
            "newText": newText,
            "newPosition": textDocumentPosition
        };
    }
    else {
        //All the nodes are loaded
        position.character = position.character - 1;
        return {
            "newText": document.getText(),
            "newPosition": position
        };
    }
}
//# sourceMappingURL=yamlWorker.js.map