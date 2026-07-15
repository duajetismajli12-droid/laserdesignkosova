// ============================================================
//  /api/push-notify — LaserDesign Kosova
//  Dërgon njoftime push te pajisjet e abonuara.
//
//  POST { token, type, phone?, title, body, url? }
//    token = PUSH_ADMIN_TOKEN (duhet të përputhet me env var)
//    type  = "order"     -> vetëm te pajisjet me të njëjtin numër telefoni
//           | "broadcast" -> te të gjitha pajisjet e abonuara
//
//  Kërkon: npm install web-push @vercel/kv
//  Env vars: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT, PUSH_ADMIN_TOKEN
// ============================================================
const { kv } = require('@vercel/kv');
const webpush = require('web-push');

const SUBS_KEY = 'push:subs';

webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:info@laserdesignkosova.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

function endpointKey(endpoint) {
    return Buffer.from(endpoint).toString('base64url');
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { token, type, phone, title, body: msgBody, url } = body;

    // Mbrojtje: vetëm paneli i administrimit (klienti dërgon tokenin e fshehtë)
    if (!token || token !== process.env.PUSH_ADMIN_TOKEN) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!title || !msgBody) {
        return res.status(400).json({ error: 'Titulli dhe përmbajtja janë të detyrueshme.' });
    }

    const all = (await kv.hgetall(SUBS_KEY)) || {};
    let entries = Object.entries(all).map(([key, value]) => {
        try { return [key, typeof value === 'string' ? JSON.parse(value) : value]; }
        catch (e) { return null; }
    }).filter(Boolean);

    // Filtrimi sipas numrit të telefonit për njoftimet e porosive
    if (type === 'order' && phone) {
        const norm = String(phone).replace(/\D+/g, '');
        entries = entries.filter(([, rec]) => {
            if (!rec.phone) return false;
            return rec.phone === norm || rec.phone.endsWith(norm) || norm.endsWith(rec.phone);
        });
    }

    const payload = JSON.stringify({ title, body: msgBody, url: url || '/' });
    const staleKeys = [];
    let sent = 0;

    await Promise.all(entries.map(async ([key, rec]) => {
        try {
            await webpush.sendNotification(rec.subscription, payload);
            sent++;
        } catch (err) {
            // 404/410 = abonimi nuk ekziston më -> pastroje
            if (err && (err.statusCode === 404 || err.statusCode === 410)) {
                staleKeys.push(key);
            } else {
                console.error('Push send error:', err && err.message);
            }
        }
    }));

    if (staleKeys.length) {
        await kv.hdel(SUBS_KEY, ...staleKeys).catch(() => {});
    }

    return res.status(200).json({ ok: true, sent, cleaned: staleKeys.length });
};
