export interface JSONSchema {
    id?: string;
    $schema?: string;
    type?: string | string[];
    title?: string;
    default?: any;
    definitions?: JSONSchemaMap;
    description?: string;
    properties?: JSONSchemaMap;
    patternProperties?: JSONSchemaMap;
    additionalProperties?: any;
    minProperties?: number;
    maxProperties?: number;
    dependencies?: JSONSchemaMap | string[];
    items?: any;
    minItems?: number;
    maxItems?: number;
    uniqueItems?: boolean;
    additionalItems?: boolean;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    minimum?: number;
    maximum?: number;
    exclusiveMinimum?: boolean;
    exclusiveMaximum?: boolean;
    multipleOf?: number;
    required?: string[];
    $ref?: string;
    anyOf?: JSONSchema[];
    allOf?: JSONSchema[];
    oneOf?: JSONSchema[];
    not?: JSONSchema;
    enum?: any[];
    format?: string;
    errorMessage?: string;
    patternErrorMessage?: string;
    deprecationMessage?: string;
    enumDescriptions?: string[];
    schemaSequence?: JSONSchema[];
    "x-kubernetes-group-version-kind"?: any;
}
export interface JSONSchemaMap {
    [name: string]: JSONSchema;
}