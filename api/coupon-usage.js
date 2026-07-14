// api/coupon-usage.js
import { kv } from '@vercel/kv';

function normalizePhone(phone) {
    const raw = String(phone || '').trim();
    const digitsOnly = raw.replace(/\D+/g, '');
    return digitsOnly || raw;
}

function getKey(phone) {
    return `laserdesign_coupon_usage:${normalizePhone(phone)}`;
}

export default async function handler(req, res) {
    try {
        if (req.method === 'GET') {
            const phone = normalizePhone(req.query.phone || '');
            const code = String(req.query.code || '').trim().toUpperCase();

            if (!phone || !code) {
                return res.status(400).json({ error: 'Kërkohen phone dhe code.' });
            }

            const usedCoupons = await kv.get(getKey(phone)) || [];
            const used = Array.isArray(usedCoupons) && usedCoupons.includes(code);
            return res.status(200).json({ used, phone, code });
        }

        if (req.method === 'POST') {
            const phone = normalizePhone(req.body?.phone || '');
            const code = String(req.body?.code || '').trim().toUpperCase();

            if (!phone || !code) {
                return res.status(400).json({ error: 'Kërkohen phone dhe code.' });
            }

            const key = getKey(phone);
            const usedCoupons = await kv.get(key) || [];
            const updatedCoupons = Array.isArray(usedCoupons) ? [...new Set([...usedCoupons, code])] : [code];
            await kv.set(key, updatedCoupons);

            return res.status(200).json({ ok: true, phone, code, usedCoupons: updatedCoupons });
        }

        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Metoda ${req.method} nuk lejohet.` });
    } catch (err) {
        return res.status(500).json({ error: 'Gabim në server: ' + err.message });
    }
}

