import type {FetchOptions, GuillotineResponse, GuillotineResponseJson, ProjectLocaleConfig} from '../types';

/** Generic fetch */
export async function fetchFromApi<Data = Record<string, unknown>>(
    apiUrl: string,
    projectConfig: ProjectLocaleConfig,
    options?: FetchOptions,
): Promise<GuillotineResponseJson> {

    const opts = {
        method: options?.method || 'POST',
        body: options?.body ? JSON.stringify(options?.body) : null,
        headers: mergeHeaders(projectConfig, options?.headers),
        next: options?.next,
        cache: options?.cache,
    };

    let res: GuillotineResponse<Data>;
    try {
        res = await fetch(apiUrl, opts as RequestInit);
    } catch (e: any) {
        console.warn(apiUrl, e);
        throw new Error(JSON.stringify({
            code: 'API',
            message: e.message,
        }));
    }

    if (!res.ok) {
        throw new Error(JSON.stringify({
            code: res.status,
            message: `Data fetching failed (message: '${await res.text()}')`,
        }));
    }

    let json: GuillotineResponseJson<Data>;
    try {
        json = await res.json();
    } catch (e) {
        throw new Error(JSON.stringify({
            code: 500,
            message: `API call completed but with non-JSON data: ${JSON.stringify(await res.text())}`,
        }));
    }

    if (!json) {
        throw new Error(JSON.stringify({
            code: 500,
            message: `API call completed but with unexpectedly empty data: ${JSON.stringify(await res.text())}`,
        }));
    }

    if (Array.isArray(json)) {
        throw new Error(JSON.stringify({
            code: 500,
            message: `API call completed but with unexpected array data: ${JSON.stringify(json)}`,
        }));
    }

    return json;
}

function mergeHeaders(projectConfig: ProjectLocaleConfig, headers?: HeadersInit): Headers {
    const newHeaders = new Headers({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    });
    if (headers) {
        for (const headersKey in headers) {
            newHeaders.set(headersKey, headers[headersKey]);
        }
        // append last to make sure it is not overwritten
    }
    newHeaders.set('X-Guillotine-SiteKey', projectConfig.site);
    return newHeaders;
}
