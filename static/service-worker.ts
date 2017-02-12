declare class Request {
    url: string;
}
declare class Response {
    clone(): Response;
}
declare function fetch(url: string | Request): Promise<Response>;

declare class ExtendableEvent extends Event {
    waitUntil<T>(promise: Promise<T>): void;
}

declare class InstallEvent extends ExtendableEvent { }
declare class FetchEvent extends ExtendableEvent {
    request: Request;
    respondWith(promise: Promise<Response>): void;
}
declare class ActivateEvent extends ExtendableEvent { }

declare class Cache {
    addAll(requests: string[]): Promise<void>;
    put(request: Request, response: Response): void;
}

declare const caches: {
    delete: (cacheName: string) => Promise<boolean>;
    has: (cacheName: string) => Promise<boolean>;
    open: (cacheName: string) => Promise<Cache>;
    keys: () => Promise<string[]>;
    match(request: Request | string, options?: Partial<{ ignoreSearch: boolean; ignoreMethod: boolean; ignoreVary: boolean; cacheName: string }>): Promise<Response>;
};

const versions: {
    staticVendorBundleCss: string;
    staticIndexBundleCss: string;
    staticVendorBundleJs: string;
    staticIndexBundleJs: string;
    staticWorkerBundleJs: string;
    staticIndexHtml: string;
} = require("./version.json");

const rootUrl = location.origin + location.pathname.substring(0, location.pathname.lastIndexOf("/") + 1);

const cacheMappers = [
    { cacheName: rootUrl + versions.staticIndexHtml, url: rootUrl },
    { cacheName: rootUrl + versions.staticIndexHtml, url: rootUrl + "index.html" },
    { cacheName: rootUrl + versions.staticVendorBundleCss, url: rootUrl + versions.staticVendorBundleCss },
    { cacheName: rootUrl + versions.staticIndexBundleCss, url: rootUrl + versions.staticIndexBundleCss },
    { cacheName: rootUrl + versions.staticVendorBundleJs, url: rootUrl + versions.staticVendorBundleJs },
    { cacheName: rootUrl + versions.staticIndexBundleJs, url: rootUrl + versions.staticIndexBundleJs },
    { cacheName: rootUrl + versions.staticWorkerBundleJs, url: rootUrl + "worker.bundle.js" },
];

function run(this: any) {
    this.addEventListener("fetch", (event: FetchEvent) => {
        if (!event.request.url.startsWith("http")) {
            return;
        }
        event.respondWith(
            caches.match(event.request).then(responseInCache => {
                if (responseInCache) {
                    return responseInCache;
                }
                return fetch(event.request).then(response => {
                    const cacheMapper = cacheMappers.find(c => c.url === event.request.url);
                    if (!cacheMapper) {
                        return response;
                    }

                    caches.open(cacheMapper.cacheName).then(cache => {
                        cache.put(event.request, response);
                    });
                    return response.clone();
                });
            }).catch(() => {
                return caches.match("/404.png");
            }),
        );
    });

    this.addEventListener("activate", (event: ActivateEvent) => {
        event.waitUntil(
            caches.keys().then(keyList => {
                return Promise.all(keyList.filter(key => cacheMappers.findIndex(c => c.cacheName === key) === -1).map(key => caches.delete(key)));
            }),
        );
    });
}

run();
