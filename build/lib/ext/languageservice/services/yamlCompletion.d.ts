import * as SchemaService from './jsonSchemaService';
import { JSONWorkerContribution } from '../jsonContributions';
import { PromiseConstructor, Thenable } from 'vscode-json-languageservice';
import { CompletionItem, CompletionList, TextDocument, Position } from 'vscode-languageserver-types';
declare global {
    interface String {
        trimLeft(): any;
        trimRight(): any;
    }
}
export declare class YAMLCompletion {
    private schemaService;
    private contributions;
    private promise;
    private customTags;
    constructor(schemaService: SchemaService.IJSONSchemaService, contributions?: JSONWorkerContribution[], promiseConstructor?: PromiseConstructor);
    configure(customTags: Array<String>): void;
    doResolve(item: CompletionItem): Thenable<CompletionItem>;
    doComplete(document: TextDocument, position: Position, doc: any): Thenable<CompletionList>;
    private getPropertyCompletions;
    private getValueCompletions;
    private getContributedValueCompletions;
    private getCustomTagValueCompletions;
    private addSchemaValueCompletions;
    private addSchemaValueCompletionsCore;
    private addDefaultValueCompletions;
    private addEnumValueCompletions;
    private collectTypes;
    private addBooleanValueCompletion;
    private addNullValueCompletion;
    private addCustomTagValueCompletion;
    private getLabelForValue;
    private getSuggestionKind;
    private getCurrentWord;
    private findItemAtOffset;
    private isInComment;
    private getInsertTextForPlainText;
    private getInsertTextForValue;
    private getInsertTextForObject;
    private getInsertTextForArray;
    private getInsertTextForProperty;
    private evaluateSeparatorAfter;
}
