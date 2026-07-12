// sw.js — Service Worker minimal, vetëm për të plotësuar kriterin teknik që
// shfletuesit (kryesisht Android/Chrome) kërkojnë për ta konsideruar faqen si
// "të instalueshme" (PWA). Nuk bën "cache" të përmbajtjes — çdo kërkesë shkon
// normalisht në rrjet, që klientët të shohin gjithmonë versionin më të fundit
// të faqes/produkteve/çmimeve.

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    // "Pass-through" i thjeshtë — asnjë cache, thjesht lë kërkesën të shkojë në rrjet normalisht.
    event.respondWith(fetch(event.request));
});
