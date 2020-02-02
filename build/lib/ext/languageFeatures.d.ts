import { LanguageServiceDefaultsImpl } from "./monaco.contribution";
import { YAMLWorker } from "./yamlWorker";
import Uri = monaco.Uri;
import Position = monaco.Position;
import Range = monaco.Range;
import Thenable = monaco.Thenable;
import CancellationToken = monaco.CancellationToken;
export interface WorkerAccessor {
    (...more: Uri[]): Thenable<YAMLWorker>;
}
export declare class DiagnosticsAdapter {
    private _languageId;
    private _worker;
    private _disposables;
    private _listener;
    constructor(_languageId: string, _worker: WorkerAccessor, defaults: LanguageServiceDefaultsImpl);
    dispose(): void;
    private _resetSchema;
    private _doValidate;
}
export declare class CompletionAdapter implements monaco.languages.CompletionItemProvider {
    private _worker;
    constructor(_worker: WorkerAccessor);
    get triggerCharacters(): string[];
    provideCompletionItems(model: monaco.editor.IReadOnlyModel, position: Position, token: CancellationToken): Thenable<monaco.languages.CompletionList>;
}
export declare class HoverAdapter implements monaco.languages.HoverProvider {
    private _worker;
    constructor(_worker: WorkerAccessor);
    provideHover(model: monaco.editor.IReadOnlyModel, position: Position, token: CancellationToken): Thenable<monaco.languages.Hover>;
}
export declare class DocumentSymbolAdapter implements monaco.languages.DocumentSymbolProvider {
    private _worker;
    constructor(_worker: WorkerAccessor);
    provideDocumentSymbols(model: monaco.editor.IReadOnlyModel, token: CancellationToken): Thenable<monaco.languages.DocumentSymbol[]>;
}
export declare class DocumentFormattingEditProvider implements monaco.languages.DocumentFormattingEditProvider {
    private _worker;
    constructor(_worker: WorkerAccessor);
    provideDocumentFormattingEdits(model: monaco.editor.IReadOnlyModel, options: monaco.languages.FormattingOptions, token: CancellationToken): Thenable<monaco.editor.ISingleEditOperation[]>;
}
export declare class DocumentRangeFormattingEditProvider implements monaco.languages.DocumentRangeFormattingEditProvider {
    private _worker;
    constructor(_worker: WorkerAccessor);
    provideDocumentRangeFormattingEdits(model: monaco.editor.IReadOnlyModel, range: Range, options: monaco.languages.FormattingOptions, token: CancellationToken): Thenable<monaco.editor.ISingleEditOperation[]>;
}
