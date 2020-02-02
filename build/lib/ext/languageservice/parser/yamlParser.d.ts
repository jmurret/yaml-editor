import { ASTNode, JSONDocument } from './jsonParser';
export declare class SingleYAMLDocument extends JSONDocument {
    private lines;
    root: any;
    errors: any;
    warnings: any;
    constructor(lines: number[]);
    getSchemas(schema: any, doc: any, node: any): any[];
    getNodeFromOffset(offset: number): ASTNode;
    private getNodeByIndent;
}
export declare class YAMLDocument {
    documents: JSONDocument[];
    private errors;
    private warnings;
    constructor(documents: JSONDocument[]);
}
export declare function parse(text: string, customTags?: any[]): YAMLDocument;
