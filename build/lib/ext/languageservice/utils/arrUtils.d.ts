import { SingleYAMLDocument } from "../parser/yamlParser";
export declare function removeDuplicates(arr: any, prop: any): any[];
export declare function getLineOffsets(textDocString: String): number[];
export declare function removeDuplicatesObj(objArray: any): any[];
export declare function matchOffsetToDocument(offset: number, jsonDocuments: any): SingleYAMLDocument;