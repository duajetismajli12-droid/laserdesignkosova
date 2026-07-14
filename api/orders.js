// api/orders.js
import { kv } from '@vercel/kv';

const KEY = 'laserdesign_orders_global';

export default async function handler(req, res) {
    try {
        if (req.method === 'GET') {
            const orders = await kv.get(KEY);
            return res.status(200).json(Array.isArray(orders) ? orders : []);
        }

        if (req.method === 'PUT') {
            const orders = req.body;
            if (!Array.isArray(orders)) {
                return res.status(400).json({ error: 'Kërkohet një listë (array) porosish.' });
            }
            await kv.set(KEY, orders);
            return res.status(200).json({ ok: true });
        }

        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).json({ error: `Metoda ${req.method} nuk lejohet.` });
    } catch (err) {
        return res.status(500).json({ error: 'Gabim në server: ' + err.message });
    }
}
