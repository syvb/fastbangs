importScripts("parsebangs.js");

self.addEventListener("install", event => {
    // TODO: caching
    self.skipWaiting(); // claim all clients immediately
});

self.addEventListener("fetch", event => event.respondWith((async () => {
    const url = new URL(event.request.url);
    if (url.pathname === "/" || url.pathname === "/s" || url.pathname === "/s/") {
        const q = url.searchParams.get("q");
        if (q) {
            const bangsDataPromise = fetch("bangs.json").then(res => res.json());
            const bangText = getBang(q);
            if (bangText) {
                const bangsData = await bangsDataPromise;
                const bang = bangsData.filter(bang => bang.t === bangText)[0];
                if (bang) {
                    const redirUrl = bang.u.replace(/{{{s}}}/g, q);
                    return new Response(redirUrl, {
                        status: 302,
                        statusText: "Moved Temporarily",
                        headers: {
                            "Location": redirUrl,
                        }
                    });
                }
            }
        }
        // TODO: serve normal homepage
    }
})()));
