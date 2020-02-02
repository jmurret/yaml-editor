import { LocalizeFunc, Options, LoadFunc } from "vscode-nls";
export declare function loadMessageBundle(file?: string): LocalizeFunc;
export declare function config(opt?: Options | string): LoadFunc;
