/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Json = require("jsonc-parser");
var uri_1 = require("../utils/uri");
var Strings = require("../utils/strings");
var nls = require("../../fillers/vscode-nls");
var localize = nls.loadMessageBundle();
/**
 * getParseErrorMessage has been removed from jsonc-parser since 1.0.0
 *
 * see https://github.com/Microsoft/node-jsonc-parser/blob/42ec16f9c91582d4267a0c48199cdac283c90fc9/CHANGELOG.md
 * 1.0.0
 *  remove nls dependency (remove getParseErrorMessage)
 */
function getParseErrorMessage(errorCode) {
    switch (errorCode) {
        case 1 /* InvalidSymbol */:
            return localize("error.invalidSymbol", "Invalid symbol");
        case 2 /* InvalidNumberFormat */:
            return localize("error.invalidNumberFormat", "Invalid number format");
        case 3 /* PropertyNameExpected */:
            return localize("error.propertyNameExpected", "Property name expected");
        case 4 /* ValueExpected */:
            return localize("error.valueExpected", "Value expected");
        case 5 /* ColonExpected */:
            return localize("error.colonExpected", "Colon expected");
        case 6 /* CommaExpected */:
            return localize("error.commaExpected", "Comma expected");
        case 7 /* CloseBraceExpected */:
            return localize("error.closeBraceExpected", "Closing brace expected");
        case 8 /* CloseBracketExpected */:
            return localize("error.closeBracketExpected", "Closing bracket expected");
        case 9 /* EndOfFileExpected */:
            return localize("error.endOfFileExpected", "End of file expected");
        default:
            return "";
    }
}
var FilePatternAssociation = /** @class */ (function () {
    function FilePatternAssociation(pattern) {
        this.combinedSchemaId =
            "schemaservice://combinedSchema/" + encodeURIComponent(pattern);
        try {
            this.patternRegExp = Strings.convertSimple2RegExp(pattern);
        }
        catch (e) {
            // invalid pattern
            this.patternRegExp = null;
        }
        this.schemas = [];
        this.combinedSchema = null;
    }
    FilePatternAssociation.prototype.addSchema = function (id) {
        this.schemas.push(id);
        this.combinedSchema = null;
    };
    FilePatternAssociation.prototype.matchesPattern = function (fileName) {
        return this.patternRegExp && this.patternRegExp.test(fileName);
    };
    FilePatternAssociation.prototype.getCombinedSchema = function (service) {
        if (!this.combinedSchema) {
            this.combinedSchema = service.createCombinedSchema(this.combinedSchemaId, this.schemas);
        }
        return this.combinedSchema;
    };
    return FilePatternAssociation;
}());
exports.FilePatternAssociation = FilePatternAssociation;
var SchemaHandle = /** @class */ (function () {
    function SchemaHandle(service, url, unresolvedSchemaContent) {
        this.service = service;
        this.url = url;
        if (unresolvedSchemaContent) {
            this.unresolvedSchema = this.service.promise.resolve(new UnresolvedSchema(unresolvedSchemaContent));
        }
    }
    SchemaHandle.prototype.getUnresolvedSchema = function () {
        if (!this.unresolvedSchema) {
            this.unresolvedSchema = this.service.loadSchema(this.url);
        }
        return this.unresolvedSchema;
    };
    SchemaHandle.prototype.getResolvedSchema = function () {
        var _this = this;
        if (!this.resolvedSchema) {
            this.resolvedSchema = this.getUnresolvedSchema().then(function (unresolved) {
                return _this.service.resolveSchemaContent(unresolved, _this.url);
            });
        }
        return this.resolvedSchema;
    };
    SchemaHandle.prototype.clearSchema = function () {
        this.resolvedSchema = null;
        this.unresolvedSchema = null;
    };
    return SchemaHandle;
}());
var UnresolvedSchema = /** @class */ (function () {
    function UnresolvedSchema(schema, errors) {
        if (errors === void 0) { errors = []; }
        this.schema = schema;
        this.errors = errors;
    }
    return UnresolvedSchema;
}());
exports.UnresolvedSchema = UnresolvedSchema;
var ResolvedSchema = /** @class */ (function () {
    function ResolvedSchema(schema, errors) {
        if (errors === void 0) { errors = []; }
        this.schema = schema;
        this.errors = errors;
    }
    ResolvedSchema.prototype.getSection = function (path) {
        return this.getSectionRecursive(path, this.schema);
    };
    ResolvedSchema.prototype.getSectionRecursive = function (path, schema) {
        var _this = this;
        if (!schema || path.length === 0) {
            return schema;
        }
        var next = path.shift();
        if (schema.properties && schema.properties[next]) {
            return this.getSectionRecursive(path, schema.properties[next]);
        }
        else if (schema.patternProperties) {
            Object.keys(schema.patternProperties).forEach(function (pattern) {
                var regex = new RegExp(pattern);
                if (regex.test(next)) {
                    return _this.getSectionRecursive(path, schema.patternProperties[pattern]);
                }
            });
        }
        else if (schema.additionalProperties) {
            return this.getSectionRecursive(path, schema.additionalProperties);
        }
        else if (next.match("[0-9]+")) {
            if (schema.items) {
                return this.getSectionRecursive(path, schema.items);
            }
            else if (Array.isArray(schema.items)) {
                try {
                    var index = parseInt(next, 10);
                    if (schema.items[index]) {
                        return this.getSectionRecursive(path, schema.items[index]);
                    }
                    return null;
                }
                catch (e) {
                    return null;
                }
            }
        }
        return null;
    };
    return ResolvedSchema;
}());
exports.ResolvedSchema = ResolvedSchema;
var JSONSchemaService = /** @class */ (function () {
    function JSONSchemaService(requestService, contextService, customSchemaProvider, promiseConstructor) {
        this.contextService = contextService;
        this.requestService = requestService;
        this.promiseConstructor = promiseConstructor || Promise;
        this.callOnDispose = [];
        this.customSchemaProvider = customSchemaProvider;
        this.contributionSchemas = {};
        this.contributionAssociations = {};
        this.schemasById = {};
        this.filePatternAssociations = [];
        this.filePatternAssociationById = {};
        this.registeredSchemasIds = {};
    }
    JSONSchemaService.prototype.getRegisteredSchemaIds = function (filter) {
        return Object.keys(this.registeredSchemasIds).filter(function (id) {
            var scheme = uri_1.default.parse(id).scheme;
            return scheme !== "schemaservice" && (!filter || filter(scheme));
        });
    };
    Object.defineProperty(JSONSchemaService.prototype, "promise", {
        get: function () {
            return this.promiseConstructor;
        },
        enumerable: true,
        configurable: true
    });
    JSONSchemaService.prototype.dispose = function () {
        while (this.callOnDispose.length > 0) {
            this.callOnDispose.pop()();
        }
    };
    JSONSchemaService.prototype.onResourceChange = function (uri) {
        uri = this.normalizeId(uri);
        var schemaFile = this.schemasById[uri];
        if (schemaFile) {
            schemaFile.clearSchema();
            return true;
        }
        return false;
    };
    JSONSchemaService.prototype.normalizeId = function (id) {
        // remove trailing '#', normalize drive capitalization
        return uri_1.default.parse(id).toString();
    };
    JSONSchemaService.prototype.setSchemaContributions = function (schemaContributions) {
        var _this = this;
        if (schemaContributions.schemas) {
            var schemas = schemaContributions.schemas;
            for (var id in schemas) {
                var normalizedId = this.normalizeId(id);
                this.contributionSchemas[normalizedId] = this.addSchemaHandle(normalizedId, schemas[id]);
            }
        }
        if (schemaContributions.schemaAssociations) {
            var schemaAssociations = schemaContributions.schemaAssociations;
            for (var pattern in schemaAssociations) {
                var associations = schemaAssociations[pattern];
                this.contributionAssociations[pattern] = associations;
                var fpa = this.getOrAddFilePatternAssociation(pattern);
                associations.forEach(function (schemaId) {
                    var id = _this.normalizeId(schemaId);
                    fpa.addSchema(id);
                });
            }
        }
    };
    JSONSchemaService.prototype.addSchemaHandle = function (id, unresolvedSchemaContent) {
        var schemaHandle = new SchemaHandle(this, id, unresolvedSchemaContent);
        this.schemasById[id] = schemaHandle;
        return schemaHandle;
    };
    JSONSchemaService.prototype.getOrAddSchemaHandle = function (id, unresolvedSchemaContent) {
        return (this.schemasById[id] || this.addSchemaHandle(id, unresolvedSchemaContent));
    };
    JSONSchemaService.prototype.getOrAddFilePatternAssociation = function (pattern) {
        var fpa = this.filePatternAssociationById[pattern];
        if (!fpa) {
            fpa = new FilePatternAssociation(pattern);
            this.filePatternAssociationById[pattern] = fpa;
            this.filePatternAssociations.push(fpa);
        }
        return fpa;
    };
    JSONSchemaService.prototype.registerExternalSchema = function (uri, filePatterns, unresolvedSchemaContent) {
        var _this = this;
        if (filePatterns === void 0) { filePatterns = null; }
        var id = this.normalizeId(uri);
        this.registeredSchemasIds[id] = true;
        if (filePatterns) {
            filePatterns.forEach(function (pattern) {
                _this.getOrAddFilePatternAssociation(pattern).addSchema(id);
            });
        }
        return unresolvedSchemaContent
            ? this.addSchemaHandle(id, unresolvedSchemaContent)
            : this.getOrAddSchemaHandle(id);
    };
    JSONSchemaService.prototype.clearExternalSchemas = function () {
        var _this = this;
        this.schemasById = {};
        this.filePatternAssociations = [];
        this.filePatternAssociationById = {};
        this.registeredSchemasIds = {};
        for (var id in this.contributionSchemas) {
            this.schemasById[id] = this.contributionSchemas[id];
            this.registeredSchemasIds[id] = true;
        }
        for (var pattern in this.contributionAssociations) {
            var fpa = this.getOrAddFilePatternAssociation(pattern);
            this.contributionAssociations[pattern].forEach(function (schemaId) {
                var id = _this.normalizeId(schemaId);
                fpa.addSchema(id);
            });
        }
    };
    JSONSchemaService.prototype.getResolvedSchema = function (schemaId) {
        var id = this.normalizeId(schemaId);
        var schemaHandle = this.schemasById[id];
        if (schemaHandle) {
            return schemaHandle.getResolvedSchema();
        }
        return this.promise.resolve(null);
    };
    JSONSchemaService.prototype.loadSchema = function (url) {
        if (!this.requestService) {
            var errorMessage = localize("json.schema.norequestservice", "Unable to load schema from '{0}'. No schema request service available", toDisplayString(url));
            return this.promise.resolve(new UnresolvedSchema({}, [errorMessage]));
        }
        return this.requestService(url).then(function (content) {
            if (!content) {
                var errorMessage = localize("json.schema.nocontent", "Unable to load schema from '{0}': No content.", toDisplayString(url));
                return new UnresolvedSchema({}, [errorMessage]);
            }
            var schemaContent = {};
            var jsonErrors = [];
            schemaContent = Json.parse(content, jsonErrors);
            var errors = jsonErrors.length
                ? [
                    localize("json.schema.invalidFormat", "Unable to parse content from '{0}': {1}.", toDisplayString(url), getParseErrorMessage(jsonErrors[0]))
                ]
                : [];
            return new UnresolvedSchema(schemaContent, errors);
        }, function (error) {
            var errorMessage = localize("json.schema.unabletoload", "Unable to load schema from '{0}': {1}", toDisplayString(url), error.toString());
            return new UnresolvedSchema({}, [errorMessage]);
        });
    };
    JSONSchemaService.prototype.resolveSchemaContent = function (schemaToResolve, schemaURL) {
        var _this = this;
        var resolveErrors = schemaToResolve.errors.slice(0);
        var schema = schemaToResolve.schema;
        var contextService = this.contextService;
        var findSection = function (schema, path) {
            if (!path) {
                return schema;
            }
            var current = schema;
            if (path[0] === "/") {
                path = path.substr(1);
            }
            path.split("/").some(function (part) {
                current = current[part];
                return !current;
            });
            return current;
        };
        var resolveLink = function (node, linkedSchema, linkPath) {
            var section = findSection(linkedSchema, linkPath);
            if (section) {
                for (var key in section) {
                    if (section.hasOwnProperty(key) && !node.hasOwnProperty(key)) {
                        node[key] = section[key];
                    }
                }
            }
            else {
                resolveErrors.push(localize("json.schema.invalidref", "$ref '{0}' in {1} can not be resolved.", linkPath, linkedSchema.id));
            }
            delete node.$ref;
        };
        var resolveExternalLink = function (node, uri, linkPath, parentSchemaURL) {
            if (contextService && !/^\w+:\/\/.*/.test(uri)) {
                uri = contextService.resolveRelativePath(uri, parentSchemaURL);
            }
            uri = _this.normalizeId(uri);
            return _this.getOrAddSchemaHandle(uri)
                .getUnresolvedSchema()
                .then(function (unresolvedSchema) {
                if (unresolvedSchema.errors.length) {
                    var loc = linkPath ? uri + "#" + linkPath : uri;
                    resolveErrors.push(localize("json.schema.problemloadingref", "Problems loading reference '{0}': {1}", loc, unresolvedSchema.errors[0]));
                }
                resolveLink(node, unresolvedSchema.schema, linkPath);
                return resolveRefs(node, unresolvedSchema.schema, uri);
            });
        };
        var resolveRefs = function (node, parentSchema, parentSchemaURL) {
            if (!node) {
                return Promise.resolve(null);
            }
            var toWalk = [node];
            var seen = [];
            var openPromises = [];
            var collectEntries = function () {
                var entries = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    entries[_i] = arguments[_i];
                }
                for (var _a = 0, entries_1 = entries; _a < entries_1.length; _a++) {
                    var entry = entries_1[_a];
                    if (typeof entry === "object") {
                        toWalk.push(entry);
                    }
                }
            };
            var collectMapEntries = function () {
                var maps = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    maps[_i] = arguments[_i];
                }
                for (var _a = 0, maps_1 = maps; _a < maps_1.length; _a++) {
                    var map = maps_1[_a];
                    if (typeof map === "object") {
                        for (var key in map) {
                            var entry = map[key];
                            toWalk.push(entry);
                        }
                    }
                }
            };
            var collectArrayEntries = function () {
                var arrays = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    arrays[_i] = arguments[_i];
                }
                for (var _a = 0, arrays_1 = arrays; _a < arrays_1.length; _a++) {
                    var array = arrays_1[_a];
                    if (Array.isArray(array)) {
                        toWalk.push.apply(toWalk, array);
                    }
                }
            };
            while (toWalk.length) {
                var next = toWalk.pop();
                if (seen.indexOf(next) >= 0) {
                    continue;
                }
                seen.push(next);
                if (next.$ref) {
                    var segments = next.$ref.split("#", 2);
                    if (segments[0].length > 0) {
                        openPromises.push(resolveExternalLink(next, segments[0], segments[1], parentSchemaURL));
                        continue;
                    }
                    else {
                        resolveLink(next, parentSchema, segments[1]);
                    }
                }
                collectEntries(next.items, next.additionalProperties, next.not);
                collectMapEntries(next.definitions, next.properties, next.patternProperties, next.dependencies);
                collectArrayEntries(next.anyOf, next.allOf, next.oneOf, next.items, next.schemaSequence);
            }
            return _this.promise.all(openPromises);
        };
        return resolveRefs(schema, schema, schemaURL).then(function (_) { return new ResolvedSchema(schema, resolveErrors); });
    };
    JSONSchemaService.prototype.getSchemaForResource = function (resource) {
        var _this = this;
        var resolveSchema = function () {
            // check for matching file names, last to first
            for (var i = _this.filePatternAssociations.length - 1; i >= 0; i--) {
                var entry = _this.filePatternAssociations[i];
                if (entry.matchesPattern(resource)) {
                    return entry.getCombinedSchema(_this).getResolvedSchema();
                }
            }
            return _this.promise.resolve(null);
        };
        if (this.customSchemaProvider) {
            return this.customSchemaProvider(resource)
                .then(function (schemaUri) {
                return _this.loadSchema(schemaUri).then(function (unsolvedSchema) {
                    return _this.resolveSchemaContent(unsolvedSchema, schemaUri);
                });
            })
                .then(function (schema) { return schema; }, function (err) {
                return resolveSchema();
            });
        }
        else {
            return resolveSchema();
        }
    };
    JSONSchemaService.prototype.createCombinedSchema = function (combinedSchemaId, schemaIds) {
        if (schemaIds.length === 1) {
            return this.getOrAddSchemaHandle(schemaIds[0]);
        }
        else {
            var combinedSchema = {
                allOf: schemaIds.map(function (schemaId) { return ({ $ref: schemaId }); })
            };
            return this.addSchemaHandle(combinedSchemaId, combinedSchema);
        }
    };
    return JSONSchemaService;
}());
exports.JSONSchemaService = JSONSchemaService;
function toDisplayString(url) {
    try {
        var uri = uri_1.default.parse(url);
        if (uri.scheme === "file") {
            return uri.fsPath;
        }
    }
    catch (e) {
        // ignore
    }
    return url;
}
//# sourceMappingURL=jsonSchemaService.js.map