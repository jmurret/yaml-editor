/// <reference types="ext/monaco" />
import { IEvent } from 'monaco-editor-core';
export declare class LanguageServiceDefaultsImpl implements monaco.languages.yaml.LanguageServiceDefaults {
    private _onDidChange;
    private _diagnosticsOptions;
    private _languageId;
    constructor(languageId: string, diagnosticsOptions: monaco.languages.yaml.DiagnosticsOptions);
    get onDidChange(): IEvent<monaco.languages.yaml.LanguageServiceDefaults>;
    get languageId(): string;
    get diagnosticsOptions(): monaco.languages.yaml.DiagnosticsOptions;
    setDiagnosticsOptions(options: monaco.languages.yaml.DiagnosticsOptions): void;
}
