// sw.js — Service Worker minimal, vetëm për të plotësuar kriterin teknik që
// shfletuesit (kryesisht Android/Chrome) kërkojnë për ta konsideruar faqen si
// "të instalueshme" (PWA). Nuk bën "cache" të përmbajtjes — çdo kërkesë shkon
// normalisht në rrjet, që klientët të shohin gjithmonë versionin më të fundit
// të faqes/produkteve/çmimeve.
//
// PËRDOITËSIM (push notifications): u shtuan dëgjuesit "push" dhe
// "notificationclick" në fund — logjika origjinale caching/kalimi mbeti e njëjtë.

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

// ==================== PUSH NOTIFICATIONS ====================
// Thirret automatikisht kur serveri (Vercel API -> /api/push-notify) dërgon
// një push te kjo pajisje — edhe kur aplikacioni është i mbyllur.
self.addEventListener('push', (event) => {
    let data = { title: 'LaserDesign Kosova', body: 'Keni një njoftim të ri.', url: '/' };

    if (event.data) {
        try {
            data = Object.assign(data, event.data.json());
        } catch (e) {
            // Nëse payload-i s'është JSON, përdori si tekst të thjeshtë
            data.body = event.data.text();
        }
    }

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: 'icon-192.png',
            badge: 'icon-192.png',
            tag: data.tag || 'laserdesign-notification',
            data: { url: data.url || '/' }
        })
    );
});

// Kur klienti prek njoftimin në ekran -> aplikacioni hapet (ose fokusohet nëse është hapur)
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.indexOf(self.location.origin) !== -1 && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) return clients.openWindow(targetUrl);
        })
    );
});
