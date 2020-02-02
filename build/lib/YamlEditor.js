"use strict";
/// <reference path="ext/monaco.d.ts"/>
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var monaco = require("monaco-editor-core");
var Worker = require("worker-loader!./ext/yaml.worker");
require("./ext/monaco.contribution");
// import * as monaco from 'monaco-yaml';
window["MonacoEnvironment"] = {
    getWorker: function (workerId, label) {
        console.log({ workerId: workerId, label: label });
        if (label === "yaml") {
            return new Worker();
        }
        return null;
    }
    // getWorkerUrl(workerId, label) {
    //   debugger;
    //   return 'monaco-editor-worker-loader-proxy.js';
    // }
};
var YamlEditor = /** @class */ (function (_super) {
    __extends(YamlEditor, _super);
    function YamlEditor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    YamlEditor.prototype.render = function () {
        var _this = this;
        return React.createElement("div", __assign({}, this.props, { ref: function (ref) { return (_this.root = ref); } }));
    };
    YamlEditor.prototype.componentDidMount = function () {
        if (this.root) {
            var options = this.props.options;
            this.editor = monaco.editor.create(this.root, __assign({ language: "yaml" }, options));
            monaco.editor.setTheme("vs-dark");
            monaco.languages["yaml"].yamlDefaults.setDiagnosticsOptions({
                validate: true,
                schemas: [
                    {
                        uri: "http://json.schemastore.org/circleciconfig",
                        fileMatch: ["*"]
                    }
                ]
            });
        }
    };
    YamlEditor.prototype.getValue = function () {
        return this.editor.getValue();
    };
    return YamlEditor;
}(React.Component));
exports.default = YamlEditor;
//# sourceMappingURL=YamlEditor.js.map