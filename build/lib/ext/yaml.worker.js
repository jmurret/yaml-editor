/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var worker = require("monaco-editor-core/esm/vs/editor/editor.worker");
var yamlWorker_1 = require("./yamlWorker");
var ctx = self;
ctx.onmessage = function () {
    // ignore the first message
    worker.initialize(function (ctx, createData) {
        return new yamlWorker_1.YAMLWorker(ctx, createData);
    });
};
//# sourceMappingURL=yaml.worker.js.map