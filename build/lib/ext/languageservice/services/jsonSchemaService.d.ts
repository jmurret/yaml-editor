import { JSONSchema } from "../jsonSchema";
import { SchemaRequestService, WorkspaceContextService, PromiseConstructor, Thenable } from "../yamlLanguageService";
export interface IJSONSchemaService {
    /**
     * Registers a schema file in the current workspace to be applicable to files that match the pattern
     */
    registerExternalSchema(uri: string, filePatterns?: string[], unresolvedSchema?: JSONSchema): ISchemaHandle;
    /**
     * Clears all cached schema files
     */
    clearExternalSchemas(): void;
    /**
     * Registers contributed schemas
     */
    setSchemaContributions(schemaContributions: ISchemaContributions): void;
    /**
     * Looks up the appropriate schema for the given URI
     */
    getSchemaForResource(resource: string): Thenable<ResolvedSchema>;
    /**
     * Returns all registered schema ids
     */
    getRegisteredSchemaIds(filter?: (scheme: any) => boolean): string[];
}
export interface ISchemaAssociations {
    [pattern: string]: string[];
}
export interface ISchemaContributions {
    schemas?: {
        [id: string]: JSONSchema;
    };
    schemaAssociations?: ISchemaAssociations;
}
export declare type CustomSchemaProvider = (uri: string) => Thenable<string>;
export interface ISchemaHandle {
    /**
     * The schema id
     */
    url: string;
    /**
     * The schema from the file, with potential $ref references
     */
    getUnresolvedSchema(): Thenable<UnresolvedSchema>;
    /**
     * The schema from the file, with references resolved
     */
    getResolvedSchema(): Thenable<ResolvedSchema>;
}
export declare class FilePatternAssociation {
    private schemas;
    private combinedSchemaId;
    private patternRegExp;
    private combinedSchema;
    constructor(pattern: string);
    addSchema(id: string): void;
    matchesPattern(fileName: string): boolean;
    getCombinedSchema(service: JSONSchemaService): ISchemaHandle;
}
export declare class UnresolvedSchema {
    schema: JSONSchema;
    errors: string[];
    constructor(schema: JSONSchema, errors?: string[]);
}
export declare class ResolvedSchema {
    schema: JSONSchema;
    errors: string[];
    constructor(schema: JSONSchema, errors?: string[]);
    getSection(path: string[]): JSONSchema;
    private getSectionRecursive;
}
export declare class JSONSchemaService implements IJSONSchemaService {
    private contributionSchemas;
    private contributionAssociations;
    private schemasById;
    private filePatternAssociations;
    private filePatternAssociationById;
    private registeredSchemasIds;
    private contextService;
    private callOnDispose;
    private requestService;
    private promiseConstructor;
    private customSchemaProvider;
    constructor(requestService: SchemaRequestService, contextService?: WorkspaceContextService, customSchemaProvider?: CustomSchemaProvider, promiseConstructor?: PromiseConstructor);
    getRegisteredSchemaIds(filter?: (scheme: any) => boolean): string[];
    get promise(): PromiseConstructor;
    dispose(): void;
    onResourceChange(uri: string): boolean;
    private normalizeId;
    setSchemaContributions(schemaContributions: ISchemaContributions): void;
    private addSchemaHandle;
    private getOrAddSchemaHandle;
    private getOrAddFilePatternAssociation;
    registerExternalSchema(uri: string, filePatterns?: string[], unresolvedSchemaContent?: JSONSchema): ISchemaHandle;
    clearExternalSchemas(): void;
    getResolvedSchema(schemaId: string): Thenable<ResolvedSchema>;
    loadSchema(url: string): Thenable<UnresolvedSchema>;
    resolveSchemaContent(schemaToResolve: UnresolvedSchema, schemaURL: string): Thenable<ResolvedSchema>;
    getSchemaForResource(resource: string): Thenable<ResolvedSchema>;
    createCombinedSchema(combinedSchemaId: string, schemaIds: string[]): ISchemaHandle;
}
