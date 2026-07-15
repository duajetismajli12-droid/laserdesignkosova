// sw.js — Service Worker minimal, vetëm për të plotësuar kriterin teknik që
// shfletuesit (kryesisht Android/Chrome) kërkojnë për ta konsideruar faqen si
// "të instalueshme" (PWA). Nuk bën "cache" të përmbajtjes — çdo kërkesë shkon
// normalisht në rrjet, që klientët të shohin gjithmonë versionin më të fundit
// të faqes/produkteve/çmimeve.
//
// PËRDITËSIM (push notifications): dëgjuesit "push", "notificationclick" dhe
// "pushsubscriptionchange" kujdesen që njoftimet të arrijnë EDAHE KUR
// aplikacioni është i mbyllur / i hequr nga lista e aplikacioneve të fundit.

const VAPID_PUBLIC_KEY = "BKba4xchpKZ6WvYyDNpWIyBntrY-xuiPhbrFEiiopMdVFu3j5-OWm4eD7SInR7otJiDID3r_RrICGkQiynKbU7E";

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

// Ndihmëse: e kthen çelësin publik VAPID (base64url) në Uint8Array për subscribe
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = self.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// Thirret automatikisht kur serveri (Vercel API -> /api/push-notify) dërgon
// një push te kjo pajisje — EDAHE KUR aplikacioni është i mbyllur.
// Shfletuesi/sistemi operativ e zgjon Service Worker-in vetëm për këtë event.
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

// Nëse shfletuesi/sistemi E NDËRRON apo SKADON abonimin push me kalimin e kohës,
// ky event rinovohet automatikisht dhe e dërgon te serveri — që njoftimet të
// vazhdojnë të arrijnë përgjithmonë pa pasur nevojë klienti të bëjë asgjë.
self.addEventListener('pushsubscriptionchange', (event) => {
    event.waitUntil(
        self.registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        }).then((newSubscription) => {
            return fetch('/api/push-subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscription: newSubscription.toJSON(), renewed: true })
            });
        }).catch(() => {
            // Nëse rinovimi dështon (p.sh. pa internet), klienti ia dërgon abonimin
            // të ri serverit herën tjetër kur hapet aplikacioni (sync në index.html).
        })
    );
});
