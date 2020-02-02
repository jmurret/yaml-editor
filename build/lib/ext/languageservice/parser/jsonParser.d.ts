import * as Json from 'jsonc-parser';
import { JSONSchema } from '../jsonSchema';
import { LanguageSettings } from '../yamlLanguageService';
export interface IRange {
    start: number;
    end: number;
}
export declare enum ErrorCode {
    Undefined = 0,
    EnumValueMismatch = 1,
    CommentsNotAllowed = 2
}
export declare enum ProblemSeverity {
    Error = 0,
    Warning = 1
}
export interface IProblem {
    location: IRange;
    severity: ProblemSeverity;
    code?: ErrorCode;
    message: string;
}
export declare class ASTNode {
    start: number;
    end: number;
    type: string;
    parent: ASTNode;
    parserSettings: LanguageSettings;
    location: Json.Segment;
    constructor(parent: ASTNode, type: string, location: Json.Segment, start: number, end?: number);
    setParserSettings(parserSettings: LanguageSettings): void;
    getPath(): Json.JSONPath;
    getChildNodes(): ASTNode[];
    getLastChild(): ASTNode;
    getValue(): any;
    contains(offset: number, includeRightBound?: boolean): boolean;
    toString(): string;
    visit(visitor: (node: ASTNode) => boolean): boolean;
    getNodeFromOffset(offset: number): ASTNode;
    getNodeCollectorCount(offset: number): Number;
    getNodeFromOffsetEndInclusive(offset: number): ASTNode;
    validate(schema: JSONSchema, validationResult: ValidationResult, matchingSchemas: ISchemaCollector): void;
}
export declare class NullASTNode extends ASTNode {
    constructor(parent: ASTNode, name: Json.Segment, start: number, end?: number);
    getValue(): any;
}
export declare class BooleanASTNode extends ASTNode {
    private value;
    constructor(parent: ASTNode, name: Json.Segment, value: boolean | string, start: number, end?: number);
    getValue(): any;
}
export declare class ArrayASTNode extends ASTNode {
    items: ASTNode[];
    constructor(parent: ASTNode, name: Json.Segment, start: number, end?: number);
    getChildNodes(): ASTNode[];
    getLastChild(): ASTNode;
    getValue(): any;
    addItem(item: ASTNode): boolean;
    visit(visitor: (node: ASTNode) => boolean): boolean;
    validate(schema: JSONSchema, validationResult: ValidationResult, matchingSchemas: ISchemaCollector): void;
}
export declare class NumberASTNode extends ASTNode {
    isInteger: boolean;
    value: number;
    constructor(parent: ASTNode, name: Json.Segment, start: number, end?: number);
    getValue(): any;
    validate(schema: JSONSchema, validationResult: ValidationResult, matchingSchemas: ISchemaCollector): void;
}
export declare class StringASTNode extends ASTNode {
    isKey: boolean;
    value: string;
    constructor(parent: ASTNode, name: Json.Segment, isKey: boolean, start: number, end?: number);
    getValue(): any;
    validate(schema: JSONSchema, validationResult: ValidationResult, matchingSchemas: ISchemaCollector): void;
}
export declare class PropertyASTNode extends ASTNode {
    key: StringASTNode;
    value: ASTNode;
    colonOffset: number;
    constructor(parent: ASTNode, key: StringASTNode);
    getChildNodes(): ASTNode[];
    getLastChild(): ASTNode;
    setValue(value: ASTNode): boolean;
    visit(visitor: (node: ASTNode) => boolean): boolean;
    validate(schema: JSONSchema, validationResult: ValidationResult, matchingSchemas: ISchemaCollector): void;
}
export declare class ObjectASTNode extends ASTNode {
    properties: PropertyASTNode[];
    constructor(parent: ASTNode, name: Json.Segment, start: number, end?: number);
    getChildNodes(): ASTNode[];
    getLastChild(): ASTNode;
    addProperty(node: PropertyASTNode): boolean;
    getFirstProperty(key: string): PropertyASTNode;
    getKeyList(): string[];
    getValue(): any;
    visit(visitor: (node: ASTNode) => boolean): boolean;
    validate(schema: JSONSchema, validationResult: ValidationResult, matchingSchemas: ISchemaCollector): void;
}
export interface IApplicableSchema {
    node: ASTNode;
    inverted?: boolean;
    schema: JSONSchema;
}
export declare enum EnumMatch {
    Key = 0,
    Enum = 1
}
export interface ISchemaCollector {
    schemas: IApplicableSchema[];
    add(schema: IApplicableSchema): void;
    merge(other: ISchemaCollector): void;
    include(node: ASTNode): boolean;
    newSub(): ISchemaCollector;
}
export declare class ValidationResult {
    problems: IProblem[];
    propertiesMatches: number;
    propertiesValueMatches: number;
    primaryValueMatches: number;
    enumValueMatch: boolean;
    enumValues: any[];
    warnings: any;
    errors: any;
    constructor();
    hasProblems(): boolean;
    mergeAll(validationResults: ValidationResult[]): void;
    merge(validationResult: ValidationResult): void;
    mergeEnumValues(validationResult: ValidationResult): void;
    mergePropertyMatch(propertyValidationResult: ValidationResult): void;
    compareGeneric(other: ValidationResult): number;
    compareKubernetes(other: ValidationResult): number;
}
export declare class JSONDocument {
    readonly root: ASTNode;
    readonly syntaxErrors: IProblem[];
    constructor(root: ASTNode, syntaxErrors: IProblem[]);
    getNodeFromOffset(offset: number): ASTNode;
    getNodeFromOffsetEndInclusive(offset: number): ASTNode;
    visit(visitor: (node: ASTNode) => boolean): void;
    configureSettings(parserSettings: LanguageSettings): void;
    validate(schema: JSONSchema): IProblem[];
    getMatchingSchemas(schema: JSONSchema, focusOffset?: number, exclude?: ASTNode): IApplicableSchema[];
    getValidationProblems(schema: JSONSchema, focusOffset?: number, exclude?: ASTNode): IProblem[];
}