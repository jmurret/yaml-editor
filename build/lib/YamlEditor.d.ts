/// <reference types="ext/monaco" />
import * as React from "react";
import * as monaco from "monaco-editor-core";
declare class YamlEditor extends React.Component<YamlEditor.Props> {
    private root;
    render(): JSX.Element;
    private editor;
    componentDidMount(): void;
    getValue(): string;
}
export declare namespace YamlEditor {
    type Props = {
        options?: monaco.editor.IEditorConstructionOptions;
    } & Pick<React.HTMLAttributes<HTMLDivElement>, "style">;
}
export default YamlEditor;
