// api/gallery.js
import { kv } from '@vercel/kv';

const INITIAL_GALLERY_ITEMS = [
    {
        id: 1,
        title: "Punim Familjar në Dru",
        desc: "Shembull gravure familjare me tekst të personalizuar dhe përfundim elegant në dru natyral.",
        image: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=900",
        templateImage: null,
        productId: 1
    },
    {
        id: 2,
        title: "Kuti Dhuratë e Personalizuar",
        desc: "Punim i mëparshëm për dhuratë speciale me emër dhe datë të gdhendur me lazer.",
        image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=900",
        templateImage: null,
        productId: 2
    },
    {
        id: 3,
        title: "Logo Biznesi e Gdhendur",
        desc: "Projekt i realizuar për ambient biznesi, me gravurë të pastër dhe pamje profesionale.",
        image: "https://images.unsplash.com/photo-1542744094-2ab25be78b90?w=900",
        templateImage: null,
        productId: 3
    },
    {
        id: 4,
        title: "Dekor Natyral me Emër",
        desc: "Punim kreativ për dekor shtëpie — ideal për inspirim para personalizimit tuaj.",
        image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900",
        templateImage: null,
        productId: null
    }
];

const KEY = 'laserdesign_gallery_items';

export default async function handler(req, res) {
    try {
        if (req.method === 'GET') {
            let galleryItems = await kv.get(KEY);
            if (!galleryItems) {
                galleryItems = INITIAL_GALLERY_ITEMS;
                await kv.set(KEY, galleryItems);
            }
            return res.status(200).json(galleryItems);
        }

        if (req.method === 'PUT') {
            const galleryItems = req.body;
            if (!Array.isArray(galleryItems)) {
                return res.status(400).json({ error: 'Kërkohet një listë (array) punimesh galerie.' });
            }
            await kv.set(KEY, galleryItems);
            return res.status(200).json({ ok: true });
        }

        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).json({ error: `Metoda ${req.method} nuk lejohet.` });
    } catch (err) {
        return res.status(500).json({ error: 'Gabim në server: ' + err.message });
    }
}

