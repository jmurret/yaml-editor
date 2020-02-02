/// <reference path="ext/monaco.d.ts"/>

import * as React from "react";
import * as monaco from "monaco-editor-core";
const Worker = require("worker-loader!./ext/yaml.worker");

require("./ext/monaco.contribution");
// import * as monaco from 'monaco-yaml';

window["MonacoEnvironment"] = {
  getWorker(workerId, label) {
    console.log({ workerId, label });
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

class YamlEditor extends React.Component<YamlEditor.Props> {
  private root: HTMLDivElement | null;
  render() {
    return <div {...this.props} ref={ref => (this.root = ref)}></div>;
  }

  private editor: monaco.editor.IStandaloneCodeEditor;
  componentDidMount() {
    if (this.root) {
      const { options } = this.props;
      this.editor = monaco.editor.create(this.root, {
        language: "yaml",
        ...options
      });
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
  }

  getValue() {
    return this.editor.getValue();
  }
}

export namespace YamlEditor {
  export type Props = {
    options?: monaco.editor.IEditorConstructionOptions;
  } & Pick<React.HTMLAttributes<HTMLDivElement>, "style">;
}

export default YamlEditor;
