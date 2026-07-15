// ============================================================
//  /api/push-subscriptions — LaserDesign Kosova
//  Ruan/fshin abonimet e njoftimeve push në Vercel KV.
//
//  POST   { subscription, phone, userAgent }  -> ruan abonimin
//  DELETE { endpoint }                        -> fshin abonimin
//
//  Kërkon: npm install @vercel/kv
// ============================================================
const { kv } = require('@vercel/kv');

const SUBS_KEY = 'push:subs';

function endpointKey(endpoint) {
    return Buffer.from(endpoint).toString('base64url');
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // ---- Verifikim për adminin: GET /api/push-subscriptions?token=XXX -> { count } ----
    if (req.method === 'GET') {
        const token = (req.query && req.query.token) || '';
        if (!token || token !== process.env.PUSH_ADMIN_TOKEN) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const all = (await kv.hgetall(SUBS_KEY)) || {};
        return res.status(200).json({ count: Object.keys(all).length });
    }

    // ---- Ruaj / përditëso një abonim ----
    if (req.method === 'POST') {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
        const { subscription, phone, userAgent } = body;

        if (!subscription || !subscription.endpoint || !subscription.keys) {
            return res.status(400).json({ error: 'Abonimi i push mungon ose është i paplotë.' });
        }

        const record = {
            subscription,
            phone: String(phone || '').replace(/\D+/g, ''), // vetëm shifra, për krahasim me porositë
            userAgent: String(userAgent || ''),
            updatedAt: Date.now()
        };

        await kv.hset(SUBS_KEY, { [endpointKey(subscription.endpoint)]: JSON.stringify(record) });
        return res.status(200).json({ ok: true });
    }

    // ---- Fshi një abonim ----
    if (req.method === 'DELETE') {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
        if (!body.endpoint) return res.status(400).json({ error: 'Endpoint mungon.' });
        await kv.hdel(SUBS_KEY, endpointKey(body.endpoint));
        return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
};

// Eksportohet për /api/push-notify
module.exports.SUBS_KEY = SUBS_KEY;
module.exports.endpointKey = endpointKey;
