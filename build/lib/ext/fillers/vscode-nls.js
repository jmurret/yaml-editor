"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
// export interface Options {
// 	locale?: string;
// 	cacheLanguageResolution?: boolean;
// }
// export interface LocalizeInfo {
// 	key: string;
// 	comment: string[];
// }
// export interface LocalizeFunc {
// 	(info: LocalizeInfo, message: string, ...args: any[]): string;
// 	(key: string, message: string, ...args: any[]): string;
// }
// export interface LoadFunc {
// 	(file?: string): LocalizeFunc;
// }
function format(message, args) {
    var result;
    if (args.length === 0) {
        result = message;
    }
    else {
        result = message.replace(/\{(\d+)\}/g, function (match, rest) {
            var index = rest[0];
            return typeof args[index] !== "undefined" ? args[index] : match;
        });
    }
    return result;
}
function localize(key, message) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    return format(message, args);
}
function loadMessageBundle(file) {
    return localize;
}
exports.loadMessageBundle = loadMessageBundle;
function config(opt) {
    return loadMessageBundle;
}
exports.config = config;
//# sourceMappingURL=vscode-nls.js.map