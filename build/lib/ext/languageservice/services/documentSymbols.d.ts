import * as Parser from '../parser/jsonParser';
import { SymbolInformation, TextDocument } from 'vscode-languageserver-types';
export declare class YAMLDocumentSymbols {
    findDocumentSymbols(document: TextDocument, doc: Parser.JSONDocument): SymbolInformation[];
    private getSymbolKind;
}
