/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var Json = require("jsonc-parser");
var SchemaService = require("./jsonSchemaService");
var vscode_languageserver_types_1 = require("vscode-languageserver-types");
var nls = require("vscode-nls");
var arrUtils_1 = require("../utils/arrUtils");
var localize = nls.loadMessageBundle();
String.prototype.trimLeft = function () {
    return this.replace(/^\s+/, "");
};
String.prototype.trimRight = function () {
    return this.replace(/^\s+/, "");
};
var YAMLCompletion = /** @class */ (function () {
    function YAMLCompletion(schemaService, contributions, promiseConstructor) {
        if (contributions === void 0) { contributions = []; }
        this.schemaService = schemaService;
        this.contributions = contributions;
        this.promise = promiseConstructor || Promise;
        this.customTags = [];
    }
    YAMLCompletion.prototype.configure = function (customTags) {
        this.customTags = customTags;
    };
    YAMLCompletion.prototype.doResolve = function (item) {
        for (var i = this.contributions.length - 1; i >= 0; i--) {
            if (this.contributions[i].resolveCompletion) {
                var resolver = this.contributions[i].resolveCompletion(item);
                if (resolver) {
                    return resolver;
                }
            }
        }
        return this.promise.resolve(item);
    };
    YAMLCompletion.prototype.doComplete = function (document, position, doc) {
        var _this = this;
        var result = {
            items: [],
            isIncomplete: false
        };
        var offset = document.offsetAt(position);
        if (document.getText()[offset] === ":") {
            return Promise.resolve(result);
        }
        var currentDoc = arrUtils_1.matchOffsetToDocument(offset, doc);
        if (currentDoc === null) {
            return Promise.resolve(result);
        }
        var currentDocIndex = doc.documents.indexOf(currentDoc);
        var node = currentDoc.getNodeFromOffsetEndInclusive(offset);
        if (this.isInComment(document, node ? node.start : 0, offset)) {
            return Promise.resolve(result);
        }
        var currentWord = this.getCurrentWord(document, offset);
        var overwriteRange = null;
        if (node && node.type === 'null') {
            var nodeStartPos = document.positionAt(node.start);
            nodeStartPos.character += 1;
            var nodeEndPos = document.positionAt(node.end);
            nodeEndPos.character += 1;
            overwriteRange = vscode_languageserver_types_1.Range.create(nodeStartPos, nodeEndPos);
        }
        else if (node && (node.type === 'string' || node.type === 'number' || node.type === 'boolean')) {
            overwriteRange = vscode_languageserver_types_1.Range.create(document.positionAt(node.start), document.positionAt(node.end));
        }
        else {
            var overwriteStart = offset - currentWord.length;
            if (overwriteStart > 0 && document.getText()[overwriteStart - 1] === '"') {
                overwriteStart--;
            }
            overwriteRange = vscode_languageserver_types_1.Range.create(document.positionAt(overwriteStart), position);
        }
        var proposed = {};
        var collector = {
            add: function (suggestion) {
                var existing = proposed[suggestion.label];
                if (!existing) {
                    proposed[suggestion.label] = suggestion;
                    if (overwriteRange) {
                        suggestion.textEdit = vscode_languageserver_types_1.TextEdit.replace(overwriteRange, suggestion.insertText);
                    }
                    result.items.push(suggestion);
                }
                else if (!existing.documentation) {
                    existing.documentation = suggestion.documentation;
                }
            },
            setAsIncomplete: function () {
                result.isIncomplete = true;
            },
            error: function (message) {
                console.error(message);
            },
            log: function (message) {
                console.log(message);
            },
            getNumberOfProposals: function () {
                return result.items.length;
            }
        };
        return this.schemaService.getSchemaForResource(document.uri).then(function (schema) {
            if (!schema) {
                return Promise.resolve(result);
            }
            var newSchema = schema;
            if (schema.schema && schema.schema.schemaSequence && schema.schema.schemaSequence[currentDocIndex]) {
                newSchema = new SchemaService.ResolvedSchema(schema.schema.schemaSequence[currentDocIndex]);
            }
            var collectionPromises = [];
            var addValue = true;
            var currentKey = '';
            var currentProperty = null;
            if (node) {
                if (node.type === 'string') {
                    var stringNode = node;
                    if (stringNode.isKey) {
                        addValue = !(node.parent && (node.parent.value));
                        currentProperty = node.parent ? node.parent : null;
                        currentKey = document.getText().substring(node.start + 1, node.end - 1);
                        if (node.parent) {
                            node = node.parent.parent;
                        }
                    }
                }
            }
            // proposals for properties
            if (node && node.type === 'object') {
                // don't suggest properties that are already present
                var properties = node.properties;
                properties.forEach(function (p) {
                    if (!currentProperty || currentProperty !== p) {
                        proposed[p.key.value] = vscode_languageserver_types_1.CompletionItem.create('__');
                    }
                });
                var separatorAfter = '';
                if (addValue) {
                    separatorAfter = _this.evaluateSeparatorAfter(document, document.offsetAt(overwriteRange.end));
                }
                if (newSchema) {
                    // property proposals with schema
                    _this.getPropertyCompletions(newSchema, currentDoc, node, addValue, collector, separatorAfter);
                }
                var location_1 = node.getPath();
                _this.contributions.forEach(function (contribution) {
                    var collectPromise = contribution.collectPropertyCompletions(document.uri, location_1, currentWord, addValue, false, collector);
                    if (collectPromise) {
                        collectionPromises.push(collectPromise);
                    }
                });
                if ((!schema && currentWord.length > 0 && document.getText().charAt(offset - currentWord.length - 1) !== '"')) {
                    collector.add({
                        kind: vscode_languageserver_types_1.CompletionItemKind.Property,
                        label: _this.getLabelForValue(currentWord),
                        insertText: _this.getInsertTextForProperty(currentWord, null, false, separatorAfter),
                        insertTextFormat: vscode_languageserver_types_1.InsertTextFormat.Snippet,
                        documentation: ''
                    });
                }
            }
            // proposals for values
            if (newSchema) {
                _this.getValueCompletions(newSchema, currentDoc, node, offset, document, collector);
            }
            if (_this.contributions.length > 0) {
                _this.getContributedValueCompletions(currentDoc, node, offset, document, collector, collectionPromises);
            }
            if (_this.customTags.length > 0) {
                _this.getCustomTagValueCompletions(collector);
            }
            return _this.promise.all(collectionPromises).then(function () {
                return result;
            });
        });
    };
    YAMLCompletion.prototype.getPropertyCompletions = function (schema, doc, node, addValue, collector, separatorAfter) {
        var _this = this;
        var matchingSchemas = doc.getMatchingSchemas(schema.schema);
        matchingSchemas.forEach(function (s) {
            if (s.node === node && !s.inverted) {
                var schemaProperties_1 = s.schema.properties;
                if (schemaProperties_1) {
                    Object.keys(schemaProperties_1).forEach(function (key) {
                        var propertySchema = schemaProperties_1[key];
                        if (!propertySchema.deprecationMessage && !propertySchema["doNotSuggest"]) {
                            collector.add({
                                kind: vscode_languageserver_types_1.CompletionItemKind.Property,
                                label: key,
                                insertText: _this.getInsertTextForProperty(key, propertySchema, addValue, separatorAfter),
                                insertTextFormat: vscode_languageserver_types_1.InsertTextFormat.Snippet,
                                documentation: propertySchema.description || ''
                            });
                        }
                    });
                }
                // Error fix
                // If this is a array of string/boolean/number
                //  test:
                //    - item1
                // it will treated as a property key since `:` has been appended
                if (node.type === 'object' && node.parent && node.parent.type === 'array' && s.schema.type !== 'object') {
                    _this.addSchemaValueCompletions(s.schema, collector, separatorAfter);
                }
            }
        });
    };
    YAMLCompletion.prototype.getValueCompletions = function (schema, doc, node, offset, document, collector) {
        var _this = this;
        var offsetForSeparator = offset;
        var parentKey = null;
        var valueNode = null;
        if (node && (node.type === 'string' || node.type === 'number' || node.type === 'boolean')) {
            offsetForSeparator = node.end;
            valueNode = node;
            node = node.parent;
        }
        if (node && node.type === 'null') {
            var nodeParent = node.parent;
            /*
             * This is going to be an object for some reason and we need to find the property
             * Its an issue with the null node
             */
            if (nodeParent && nodeParent.type === "object") {
                for (var prop in nodeParent["properties"]) {
                    var currNode = nodeParent["properties"][prop];
                    if (currNode.key && currNode.key.location === node.location) {
                        node = currNode;
                    }
                }
            }
        }
        if (!node) {
            this.addSchemaValueCompletions(schema.schema, collector, "");
            return;
        }
        if ((node.type === 'property') && offset > node.colonOffset) {
            var propertyNode = node;
            var valueNode_1 = propertyNode.value;
            if (valueNode_1 && offset > valueNode_1.end) {
                return; // we are past the value node
            }
            parentKey = propertyNode.key.value;
            node = node.parent;
        }
        var separatorAfter = this.evaluateSeparatorAfter(document, offsetForSeparator);
        if (node && (parentKey !== null || node.type === 'array')) {
            var matchingSchemas = doc.getMatchingSchemas(schema.schema);
            matchingSchemas.forEach(function (s) {
                if (s.node === node && !s.inverted && s.schema) {
                    if (s.schema.items) {
                        if (Array.isArray(s.schema.items)) {
                            var index = _this.findItemAtOffset(node, document, offset);
                            if (index < s.schema.items.length) {
                                _this.addSchemaValueCompletions(s.schema.items[index], collector, separatorAfter, true);
                            }
                        }
                        else if (s.schema.items.type === 'object') {
                            collector.add({
                                kind: _this.getSuggestionKind(s.schema.items.type),
                                label: "- (array item)",
                                documentation: "Create an item of an array" + (s.schema.description === undefined ? '' : '(' + s.schema.description + ')'),
                                insertText: "- " + _this.getInsertTextForObject(s.schema.items, separatorAfter).insertText.trimLeft(),
                                insertTextFormat: vscode_languageserver_types_1.InsertTextFormat.Snippet,
                            });
                        }
                        else {
                            _this.addSchemaValueCompletions(s.schema.items, collector, separatorAfter, true);
                        }
                    }
                    if (s.schema.properties) {
                        var propertySchema = s.schema.properties[parentKey];
                        if (propertySchema) {
                            _this.addSchemaValueCompletions(propertySchema, collector, separatorAfter, false);
                        }
                    }
                }
            });
        }
    };
    YAMLCompletion.prototype.getContributedValueCompletions = function (doc, node, offset, document, collector, collectionPromises) {
        if (!node) {
            this.contributions.forEach(function (contribution) {
                var collectPromise = contribution.collectDefaultCompletions(document.uri, collector);
                if (collectPromise) {
                    collectionPromises.push(collectPromise);
                }
            });
        }
        else {
            if (node.type === 'string' || node.type === 'number' || node.type === 'boolean' || node.type === 'null') {
                node = node.parent;
            }
            if ((node.type === 'property') && offset > node.colonOffset) {
                var parentKey_1 = node.key.value;
                var valueNode = node.value;
                if (!valueNode || offset <= valueNode.end) {
                    var location_2 = node.parent.getPath();
                    this.contributions.forEach(function (contribution) {
                        var collectPromise = contribution.collectValueCompletions(document.uri, location_2, parentKey_1, collector);
                        if (collectPromise) {
                            collectionPromises.push(collectPromise);
                        }
                    });
                }
            }
        }
    };
    YAMLCompletion.prototype.getCustomTagValueCompletions = function (collector) {
        var _this = this;
        this.customTags.forEach(function (customTagItem) {
            var tagItemSplit = customTagItem.split(" ");
            if (tagItemSplit && tagItemSplit[0]) {
                _this.addCustomTagValueCompletion(collector, " ", tagItemSplit[0]);
            }
        });
    };
    YAMLCompletion.prototype.addSchemaValueCompletions = function (schema, collector, separatorAfter, forArrayItem) {
        if (forArrayItem === void 0) { forArrayItem = false; }
        var types = {};
        this.addSchemaValueCompletionsCore(schema, collector, types, separatorAfter, forArrayItem);
        if (types['boolean']) {
            this.addBooleanValueCompletion(true, collector, separatorAfter);
            this.addBooleanValueCompletion(false, collector, separatorAfter);
        }
        if (types['null']) {
            this.addNullValueCompletion(collector, separatorAfter);
        }
    };
    YAMLCompletion.prototype.addSchemaValueCompletionsCore = function (schema, collector, types, separatorAfter, forArrayItem) {
        var _this = this;
        if (forArrayItem === void 0) { forArrayItem = false; }
        this.addDefaultValueCompletions(schema, collector, separatorAfter, 0, forArrayItem);
        this.addEnumValueCompletions(schema, collector, separatorAfter, forArrayItem);
        this.collectTypes(schema, types);
        if (Array.isArray(schema.allOf)) {
            schema.allOf.forEach(function (s) { return _this.addSchemaValueCompletionsCore(s, collector, types, separatorAfter, forArrayItem); });
        }
        if (Array.isArray(schema.anyOf)) {
            schema.anyOf.forEach(function (s) { return _this.addSchemaValueCompletionsCore(s, collector, types, separatorAfter, forArrayItem); });
        }
        if (Array.isArray(schema.oneOf)) {
            schema.oneOf.forEach(function (s) { return _this.addSchemaValueCompletionsCore(s, collector, types, separatorAfter, forArrayItem); });
        }
    };
    YAMLCompletion.prototype.addDefaultValueCompletions = function (schema, collector, separatorAfter, arrayDepth, forArrayItem) {
        if (arrayDepth === void 0) { arrayDepth = 0; }
        if (forArrayItem === void 0) { forArrayItem = false; }
        var hasProposals = false;
        if (schema.default) {
            var type = schema.type;
            var value = schema.default;
            for (var i = arrayDepth; i > 0; i--) {
                value = [value];
                type = 'array';
            }
            collector.add({
                kind: this.getSuggestionKind(type),
                label: forArrayItem ? "- " + this.getLabelForValue(value) : this.getLabelForValue(value),
                insertText: forArrayItem ? "- " + this.getInsertTextForValue(value, separatorAfter) : this.getInsertTextForValue(value, separatorAfter),
                insertTextFormat: vscode_languageserver_types_1.InsertTextFormat.Snippet,
                detail: localize('json.suggest.default', 'Default value'),
            });
            hasProposals = true;
        }
        if (!hasProposals && schema.items && !Array.isArray(schema.items)) {
            this.addDefaultValueCompletions(schema.items, collector, separatorAfter, arrayDepth + 1);
        }
    };
    YAMLCompletion.prototype.addEnumValueCompletions = function (schema, collector, separatorAfter, forArrayItem) {
        if (forArrayItem === void 0) { forArrayItem = false; }
        if (Array.isArray(schema.enum)) {
            for (var i = 0, length_1 = schema.enum.length; i < length_1; i++) {
                var enm = schema.enum[i];
                var documentation = schema.description;
                if (schema.enumDescriptions && i < schema.enumDescriptions.length) {
                    documentation = schema.enumDescriptions[i];
                }
                collector.add({
                    kind: this.getSuggestionKind(schema.type),
                    label: forArrayItem ? "- " + this.getLabelForValue(enm) : this.getLabelForValue(enm),
                    insertText: forArrayItem ? "- " + this.getInsertTextForValue(enm, separatorAfter) : this.getInsertTextForValue(enm, separatorAfter),
                    insertTextFormat: vscode_languageserver_types_1.InsertTextFormat.Snippet,
                    documentation: documentation
                });
            }
        }
    };
    YAMLCompletion.prototype.collectTypes = function (schema, types) {
        var type = schema.type;
        if (Array.isArray(type)) {
            type.forEach(function (t) { return types[t] = true; });
        }
        else {
            types[type] = true;
        }
    };
    YAMLCompletion.prototype.addBooleanValueCompletion = function (value, collector, separatorAfter) {
        collector.add({
            kind: this.getSuggestionKind('boolean'),
            label: value ? 'true' : 'false',
            insertText: this.getInsertTextForValue(value, separatorAfter),
            insertTextFormat: vscode_languageserver_types_1.InsertTextFormat.Snippet,
            documentation: ''
        });
    };
    YAMLCompletion.prototype.addNullValueCompletion = function (collector, separatorAfter) {
        collector.add({
            kind: this.getSuggestionKind('null'),
            label: 'null',
            insertText: 'null' + separatorAfter,
            insertTextFormat: vscode_languageserver_types_1.InsertTextFormat.Snippet,
            documentation: ''
        });
    };
    YAMLCompletion.prototype.addCustomTagValueCompletion = function (collector, separatorAfter, label) {
        collector.add({
            kind: this.getSuggestionKind('string'),
            label: label,
            insertText: label + separatorAfter,
            insertTextFormat: vscode_languageserver_types_1.InsertTextFormat.Snippet,
            documentation: ''
        });
    };
    YAMLCompletion.prototype.getLabelForValue = function (value) {
        var label = typeof value === "string" ? value : JSON.stringify(value);
        if (label.length > 57) {
            return label.substr(0, 57).trim() + '...';
        }
        return label;
    };
    YAMLCompletion.prototype.getSuggestionKind = function (type) {
        if (Array.isArray(type)) {
            var array = type;
            type = array.length > 0 ? array[0] : null;
        }
        if (!type) {
            return vscode_languageserver_types_1.CompletionItemKind.Value;
        }
        switch (type) {
            case 'string': return vscode_languageserver_types_1.CompletionItemKind.Value;
            case 'object': return vscode_languageserver_types_1.CompletionItemKind.Module;
            case 'property': return vscode_languageserver_types_1.CompletionItemKind.Property;
            default: return vscode_languageserver_types_1.CompletionItemKind.Value;
        }
    };
    YAMLCompletion.prototype.getCurrentWord = function (document, offset) {
        var i = offset - 1;
        var text = document.getText();
        while (i >= 0 && ' \t\n\r\v":{[,]}'.indexOf(text.charAt(i)) === -1) {
            i--;
        }
        return text.substring(i + 1, offset);
    };
    YAMLCompletion.prototype.findItemAtOffset = function (node, document, offset) {
        var scanner = Json.createScanner(document.getText(), true);
        var children = node.getChildNodes();
        for (var i = children.length - 1; i >= 0; i--) {
            var child = children[i];
            if (offset > child.end) {
                scanner.setPosition(child.end);
                var token = scanner.scan();
                if (token === 5 /* CommaToken */ && offset >= scanner.getTokenOffset() + scanner.getTokenLength()) {
                    return i + 1;
                }
                return i;
            }
            else if (offset >= child.start) {
                return i;
            }
        }
        return 0;
    };
    YAMLCompletion.prototype.isInComment = function (document, start, offset) {
        var scanner = Json.createScanner(document.getText(), false);
        scanner.setPosition(start);
        var token = scanner.scan();
        while (token !== 17 /* EOF */ && (scanner.getTokenOffset() + scanner.getTokenLength() < offset)) {
            token = scanner.scan();
        }
        return (token === 12 /* LineCommentTrivia */ || token === 13 /* BlockCommentTrivia */) && scanner.getTokenOffset() <= offset;
    };
    YAMLCompletion.prototype.getInsertTextForPlainText = function (text) {
        return text.replace(/[\\\$\}]/g, '\\$&'); // escape $, \ and }
    };
    YAMLCompletion.prototype.getInsertTextForValue = function (value, separatorAfter) {
        var text = value;
        if (text === '{}') {
            return '{\n\t$1\n}' + separatorAfter;
        }
        else if (text === '[]') {
            return '[\n\t$1\n]' + separatorAfter;
        }
        return this.getInsertTextForPlainText(text + separatorAfter);
    };
    YAMLCompletion.prototype.getInsertTextForObject = function (schema, separatorAfter, indent, insertIndex) {
        var _this = this;
        if (indent === void 0) { indent = '\t'; }
        if (insertIndex === void 0) { insertIndex = 1; }
        var insertText = "";
        if (!schema.properties) {
            insertText = indent + "$" + insertIndex++ + "\n";
            return { insertText: insertText, insertIndex: insertIndex };
        }
        Object.keys(schema.properties).forEach(function (key) {
            var propertySchema = schema.properties[key];
            var type = Array.isArray(propertySchema.type) ? propertySchema.type[0] : propertySchema.type;
            if (!type) {
                if (propertySchema.properties) {
                    type = 'object';
                }
                if (propertySchema.items) {
                    type = 'array';
                }
            }
            if (schema.required && schema.required.indexOf(key) > -1) {
                switch (type) {
                    case 'boolean':
                    case 'string':
                    case 'number':
                    case 'integer':
                        insertText += "" + indent + key + ": $" + insertIndex++ + "\n";
                        break;
                    case 'array':
                        var arrayInsertResult = _this.getInsertTextForArray(propertySchema.items, separatorAfter, indent + "\t", insertIndex++);
                        insertIndex = arrayInsertResult.insertIndex;
                        insertText += "" + indent + key + ":\n" + indent + "\t- " + arrayInsertResult.insertText + "\n";
                        break;
                    case 'object':
                        var objectInsertResult = _this.getInsertTextForObject(propertySchema, separatorAfter, indent + "\t", insertIndex++);
                        insertIndex = objectInsertResult.insertIndex;
                        insertText += "" + indent + key + ":\n" + objectInsertResult.insertText + "\n";
                        break;
                }
            }
            else if (propertySchema.default !== undefined) {
                switch (type) {
                    case 'boolean':
                    case 'string':
                    case 'number':
                    case 'integer':
                        insertText += "" + indent + key + ": ${" + insertIndex++ + ":" + propertySchema.default + "}\n";
                        break;
                    case 'array':
                    case 'object':
                        // TODO: support default value for array object
                        break;
                }
            }
        });
        if (insertText.trim().length === 0) {
            insertText = indent + "$" + insertIndex++ + "\n";
        }
        insertText = insertText.trimRight() + separatorAfter;
        return { insertText: insertText, insertIndex: insertIndex };
    };
    YAMLCompletion.prototype.getInsertTextForArray = function (schema, separatorAfter, indent, insertIndex) {
        if (indent === void 0) { indent = '\t'; }
        if (insertIndex === void 0) { insertIndex = 1; }
        var insertText = '';
        if (!schema) {
            insertText = "$" + insertIndex++;
        }
        var type = Array.isArray(schema.type) ? schema.type[0] : schema.type;
        if (!type) {
            if (schema.properties) {
                type = 'object';
            }
            if (schema.items) {
                type = 'array';
            }
        }
        switch (schema.type) {
            case 'boolean':
                insertText = "${" + insertIndex++ + ":false}";
                break;
            case 'number':
            case 'integer':
                insertText = "${" + insertIndex++ + ":0}";
                break;
            case 'string':
                insertText = "${" + insertIndex++ + ":null}";
                break;
            case 'object':
                var objectInsertResult = this.getInsertTextForObject(schema, separatorAfter, indent + "\t", insertIndex++);
                insertText = objectInsertResult.insertText.trimLeft();
                insertIndex = objectInsertResult.insertIndex;
                break;
        }
        return { insertText: insertText, insertIndex: insertIndex };
    };
    YAMLCompletion.prototype.getInsertTextForProperty = function (key, propertySchema, addValue, separatorAfter) {
        var propertyText = this.getInsertTextForValue(key, '');
        // if (!addValue) {
        // 	return propertyText;
        // }
        var resultText = propertyText + ':';
        var value;
        if (propertySchema) {
            if (propertySchema.default !== undefined) {
                value = " ${1:" + propertySchema.default + "}";
            }
            else if (propertySchema.properties) {
                return resultText + "\n" + this.getInsertTextForObject(propertySchema, separatorAfter).insertText;
            }
            else if (propertySchema.items) {
                return resultText + "\n\t- " + this.getInsertTextForArray(propertySchema.items, separatorAfter).insertText;
            }
            else {
                var type = Array.isArray(propertySchema.type) ? propertySchema.type[0] : propertySchema.type;
                switch (type) {
                    case 'boolean':
                        value = ' $1';
                        break;
                    case 'string':
                        value = ' $1';
                        break;
                    case 'object':
                        value = '\n\t';
                        break;
                    case 'array':
                        value = '\n\t- ';
                        break;
                    case 'number':
                    case 'integer':
                        value = ' ${1:0}';
                        break;
                    case 'null':
                        value = ' ${1:null}';
                        break;
                    default:
                        return propertyText;
                }
            }
        }
        if (!value) {
            value = '$1';
        }
        return resultText + value + separatorAfter;
    };
    YAMLCompletion.prototype.evaluateSeparatorAfter = function (document, offset) {
        var scanner = Json.createScanner(document.getText(), true);
        scanner.setPosition(offset);
        var token = scanner.scan();
        switch (token) {
            case 5 /* CommaToken */:
            case 2 /* CloseBraceToken */:
            case 4 /* CloseBracketToken */:
            case 17 /* EOF */:
                return '';
            default:
                return '';
        }
    };
    return YAMLCompletion;
}());
exports.YAMLCompletion = YAMLCompletion;
//# sourceMappingURL=yamlCompletion.js.map