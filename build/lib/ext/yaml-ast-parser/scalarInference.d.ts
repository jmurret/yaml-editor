import { YAMLScalar } from './yamlAST';
export declare function parseYamlBoolean(input: string): boolean;
export declare function parseYamlInteger(input: string): number;
export declare function parseYamlFloat(input: string): number;
export declare enum ScalarType {
    null = 0,
    bool = 1,
    int = 2,
    float = 3,
    string = 4
}
/** Determines the type of a scalar according to
  * the YAML 1.2 Core Schema (http://www.yaml.org/spec/1.2/spec.html#id2804923)
  */
export declare function determineScalarType(node: YAMLScalar): ScalarType;
