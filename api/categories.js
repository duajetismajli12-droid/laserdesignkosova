// api/categories.js
import { kv } from '@vercel/kv';

const INITIAL_CATEGORIES = [
    { id: 1, value: "shtëpi", label: "Shtëpi", icon: "fa-solid fa-house" },
    { id: 2, value: "dhurata", label: "Dhurata", icon: "fa-solid fa-gift" },
    { id: 3, value: "biznes", label: "Biznes", icon: "fa-solid fa-briefcase" },
    { id: 4, value: "islamike", label: "Islamike", icon: "fa-solid fa-moon" }
];

const KEY = 'laserdesign_categories';

export default async function handler(req, res) {
    try {
        if (req.method === 'GET') {
            let categories = await kv.get(KEY);
            if (!categories) {
                categories = INITIAL_CATEGORIES;
                await kv.set(KEY, categories);
            }
            return res.status(200).json(categories);
        }

        if (req.method === 'PUT') {
            const categories = req.body;
            if (!Array.isArray(categories)) {
                return res.status(400).json({ error: 'Kërkohet një listë (array) kategorish.' });
            }
            await kv.set(KEY, categories);
            return res.status(200).json({ ok: true });
        }

        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).json({ error: `Metoda ${req.method} nuk lejohet.` });
    } catch (err) {
        return res.status(500).json({ error: 'Gabim në server: ' + err.message });
    }
}
