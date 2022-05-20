// SPDX-License-Identifier: Apache-2.0
importScripts("parsebangs.js");

self.addEventListener("install", event => {
    event.waitUntil((async () => {
        (await caches.open("v1")).addAll([
            "bangs.json",
        ]);
        self.skipWaiting(); // don't wait to activate
    })());
});

self.addEventListener("activate", event => {
    // takeover existing pages
    event.waitUntil((async () => {
        await clients.claim();
        (await clients.matchAll()).forEach(client => {
            client.postMessage({
                type: "sw-activated",
            });
        });
    })());
})

const bangsDataPromise = caches.match("bangs.json").then(res => res.json()).catch(error => fetch("bangs.json").then(res => res.json()));
async function getBangData(bangText) {
    return (await bangsDataPromise).filter(bang => bang.t === bangText)[0];
}

self.addEventListener("fetch", event => event.respondWith((async () => {
    const url = new URL(event.request.url);
    if (url.pathname === "/" || url.pathname === "/s" || url.pathname === "/s/") {
        const q = url.searchParams.get("q");
        const defaul = url.searchParams.get("d");
        if (q !== null) {
            const { bangText, removed } = getBang(q);
            let bang;
            if (bangText) bang = await getBangData(bangText);
            if (!bang && defaul) bang = await getBangData(defaul);
            if (!bang) bang = await getBangData("duckduckgo");
            const redirUrl = bang.u.replace(/{{{s}}}/g, encodeURIComponent(removed));
            return new Response(redirUrl, {
                status: 302,
                statusText: "Moved Temporarily",
                headers: {
                    "Location": redirUrl,
                }
            });
        }
    }
    return fetch(event.request);
})()));
