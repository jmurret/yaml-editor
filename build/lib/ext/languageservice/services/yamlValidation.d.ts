import { Thenable, LanguageSettings } from '../yamlLanguageService';
export declare class YAMLValidation {
    private jsonSchemaService;
    private promise;
    private comments;
    private validationEnabled;
    constructor(jsonSchemaService: any, promiseConstructor: any);
    configure(shouldValidate: LanguageSettings): void;
    doValidation(textDocument: any, yamlDocument: any): Thenable<any[]>;
}
