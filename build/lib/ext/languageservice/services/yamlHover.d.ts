import * as SchemaService from './jsonSchemaService';
import { JSONWorkerContribution } from '../jsonContributions';
import { PromiseConstructor, Thenable } from 'vscode-json-languageservice';
import { Hover, TextDocument, Position } from 'vscode-languageserver-types';
export declare class YAMLHover {
    private schemaService;
    private contributions;
    private promise;
    constructor(schemaService: SchemaService.IJSONSchemaService, contributions: JSONWorkerContribution[], promiseConstructor: PromiseConstructor);
    doHover(document: TextDocument, position: Position, doc: any): Thenable<Hover>;
}
