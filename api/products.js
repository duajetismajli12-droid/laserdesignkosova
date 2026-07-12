// api/products.js
// Kjo funksionon si "backend" i vogël: ruan dhe kthen listën e produkteve
// nga Vercel KV (bazë e dhënash qendrore), në vend të localStorage.

import { kv } from '@vercel/kv';

// Produktet fillestare — përdoren vetëm herën e parë, nëse KV është ende bosh.
const INITIAL_PRODUCTS = [
    {
        id: 1,
        title: "Orë Muri me Gravurë",
        price: 25.00,
        category: "shtëpi",
        image: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=500",
        desc: "Orë muri unike e punuar nga druri i dushkut me detaje precize me lazer. Çmimi ndryshon sipas madhësisë së zgjedhur.",
        sizes: ["30x30 cm", "40x40 cm", "50x50 cm"],
        sizePrices: { "30x30 cm": 25.00, "40x40 cm": 35.00, "50x50 cm": 48.00 },
        time: "1-2 ditë",
        ratingsList: [5, 5, 4, 5]
    },
    {
        id: 2,
        title: "Kuti Dhuratash Personale",
        price: 15.00,
        category: "dhurata",
        image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=500",
        desc: "Kuti druri ideale për dhurata, me mundësi gdhendjeje të emrit tuaj. Çmimi ndryshon sipas madhësisë së zgjedhur.",
        sizes: ["20x15 cm", "30x20 cm"],
        sizePrices: { "20x15 cm": 15.00, "30x20 cm": 22.00 },
        time: "1 ditë",
        ratingsList: [4, 4, 5, 3]
    },
    {
        id: 3,
        title: "Logo Biznesi në Dru",
        price: 45.00,
        category: "biznes",
        image: "https://images.unsplash.com/photo-1542744094-2ab25be78b90?w=500",
        desc: "Tabela profesionale me logon e biznesit tuaj për zyrë ose ambient të jashtëm. Çmimi ndryshon sipas madhësisë.",
        sizes: ["40x30 cm", "50x40 cm", "70x50 cm"],
        sizePrices: { "40x30 cm": 45.00, "50x40 cm": 65.00, "70x50 cm": 95.00 },
        time: "2-3 ditë",
        ratingsList: [5, 5, 5]
    }
];

const KEY = 'laserdesign_products';

export default async function handler(req, res) {
    try {
        if (req.method === 'GET') {
            // Lexon produktet nga KV; nëse s'ka ende asgjë, i vendos ato fillestare.
            let products = await kv.get(KEY);
            if (!products) {
                products = INITIAL_PRODUCTS;
                await kv.set(KEY, products);
            }
            return res.status(200).json(products);
        }

        if (req.method === 'PUT') {
            // Ruan/zëvendëson gjithë listën e produkteve (përdoret nga admin: shto/redakto/fshi).
            const products = req.body;
            if (!Array.isArray(products)) {
                return res.status(400).json({ error: 'Kërkohet një listë (array) produktesh.' });
            }
            await kv.set(KEY, products);
            return res.status(200).json({ ok: true });
        }

        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).json({ error: `Metoda ${req.method} nuk lejohet.` });
    } catch (err) {
        return res.status(500).json({ error: 'Gabim në server: ' + err.message });
    }
}
