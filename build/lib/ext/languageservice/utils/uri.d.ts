/**
 * Uniform Resource Identifier (URI) http://tools.ietf.org/html/rfc3986.
 * This class is a simple parser which creates the basic component paths
 * (http://tools.ietf.org/html/rfc3986#section-3) with minimal validation
 * and encoding.
 *
 *       foo://example.com:8042/over/there?name=ferret#nose
 *       \_/   \______________/\_________/ \_________/ \__/
 *        |           |            |            |        |
 *     scheme     authority       path        query   fragment
 *        |   _____________________|__
 *       / \ /                        \
 *       urn:example:animal:ferret:nose
 *
 *
 */
export default class URI {
    private static _empty;
    private static _slash;
    private static _regexp;
    private static _driveLetterPath;
    private static _upperCaseDrive;
    private _scheme;
    private _authority;
    private _path;
    private _query;
    private _fragment;
    private _formatted;
    private _fsPath;
    constructor();
    /**
     * scheme is the 'http' part of 'http://www.msft.com/some/path?query#fragment'.
     * The part before the first colon.
     */
    get scheme(): string;
    /**
     * authority is the 'www.msft.com' part of 'http://www.msft.com/some/path?query#fragment'.
     * The part between the first double slashes and the next slash.
     */
    get authority(): string;
    /**
     * path is the '/some/path' part of 'http://www.msft.com/some/path?query#fragment'.
     */
    get path(): string;
    /**
     * query is the 'query' part of 'http://www.msft.com/some/path?query#fragment'.
     */
    get query(): string;
    /**
     * fragment is the 'fragment' part of 'http://www.msft.com/some/path?query#fragment'.
     */
    get fragment(): string;
    /**
     * Returns a string representing the corresponding file system path of this URI.
     * Will handle UNC paths and normalize windows drive letters to lower-case. Also
     * uses the platform specific path separator. Will *not* validate the path for
     * invalid characters and semantics. Will *not* look at the scheme of this URI.
     */
    get fsPath(): string;
    with(scheme: string, authority: string, path: string, query: string, fragment: string): URI;
    withScheme(value: string): URI;
    withAuthority(value: string): URI;
    withPath(value: string): URI;
    withQuery(value: string): URI;
    withFragment(value: string): URI;
    static parse(value: string): URI;
    static file(path: string): URI;
    private static _parseComponents;
    static create(scheme?: string, authority?: string, path?: string, query?: string, fragment?: string): URI;
    private static _validate;
    /**
     *
     * @param skipEncoding Do not encode the result, default is `false`
     */
    toString(skipEncoding?: boolean): string;
    private static _asFormatted;
    toJSON(): any;
}
