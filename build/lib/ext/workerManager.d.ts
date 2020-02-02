import { LanguageServiceDefaultsImpl } from "./monaco.contribution";
import { YAMLWorker } from "./yamlWorker";
import Promise = monaco.Promise;
import Uri = monaco.Uri;
export declare class WorkerManager {
    private _defaults;
    private _idleCheckInterval;
    private _lastUsedTime;
    private _configChangeListener;
    private _worker;
    private _client;
    constructor(defaults: LanguageServiceDefaultsImpl);
    private _stopWorker;
    dispose(): void;
    private _checkIfIdle;
    private _getClient;
    getLanguageServiceWorker(...resources: Uri[]): Promise<YAMLWorker>;
}
