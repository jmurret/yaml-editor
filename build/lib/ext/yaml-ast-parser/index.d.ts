/**
 * Created by kor on 06/05/15.
 */
export { load, loadAll, safeLoad, safeLoadAll, LoadOptions } from './loader';
export { dump, safeDump } from './dumper';
import YAMLException from './exception';
export * from './yamlAST';
export declare type Error = YAMLException;
export * from './scalarInference';
