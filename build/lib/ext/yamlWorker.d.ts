import Thenable = monaco.Thenable;
import IWorkerContext = monaco.worker.IWorkerContext;
import * as ls from 'vscode-languageserver-types';
import * as yamlService from './languageservice/yamlLanguageService';
import { SchemaRequestService } from './languageservice/yamlLanguageService';
export declare class YAMLWorker {
    private _ctx;
    private _languageService;
    private _languageSettings;
    private _languageId;
    constructor(ctx: IWorkerContext, createData: ICreateData);
    doValidation(uri: string): Thenable<ls.Diagnostic[]>;
    doComplete(uri: string, position: ls.Position): Thenable<ls.CompletionList>;
    doResolve(item: ls.CompletionItem): Thenable<ls.CompletionItem>;
    doHover(uri: string, position: ls.Position): Thenable<ls.Hover>;
    format(uri: string, range: ls.Range, options: ls.FormattingOptions): Thenable<ls.TextEdit[]>;
    resetSchema(uri: string): Thenable<boolean>;
    findDocumentSymbols(uri: string): Thenable<ls.SymbolInformation[]>;
    private _getTextDocument;
}
export interface ICreateData {
    languageId: string;
    languageSettings: yamlService.LanguageSettings;
    schemaRequestService?: SchemaRequestService;
}
export declare function create(ctx: IWorkerContext, createData: ICreateData): YAMLWorker;
export declare function getLineOffsets(textDocString: String): number[];
