// SPDX-License-Identifier: Apache-2.0
importScripts("parsebangs.js");

self.addEventListener("install", event => {
    self.skipWaiting(); // claim all clients immediately
});

// TODO cache this
const bangsDataPromise = fetch("bangs.json").then(res => res.json());
async function getBangData(bangText) {
    return (await bangsDataPromise).filter(bang => bang.t === bangText)[0];
}

self.addEventListener("fetch", event => event.respondWith((async () => {
    const url = new URL(event.request.url);
    if (url.pathname === "/" || url.pathname === "/s" || url.pathname === "/s/") {
        const q = url.searchParams.get("q");
        const defaul = url.searchParams.get("d");
        if (q) {
            const { bangText, removed } = getBang(q);
            let bang;
            if (bangText) bang = await getBangData(bangText);
            if (!bang && defaul) bang = await getBangData(defaul);
            if (!bang) bang = await getBangData("duckduckgo");
            const redirUrl = bang.u.replace(/{{{s}}}/g, removed);
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
