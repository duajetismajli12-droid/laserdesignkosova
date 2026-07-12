// api/offers.js
import { kv } from '@vercel/kv';

const INITIAL_OFFERS = [
    {
        id: 1,
        type: "ofertë",
        tag: "-20%",
        title: "Zbritje Verore 20%",
        desc: "Përfitoni 20% zbritje në të gjitha porositë deri në fund të muajit. Përdoreni kodin gjatë pagesës.",
        image: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=500",
        date: "Aktive deri më 31 Korrik",
        couponCode: "LASER20"
    },
    {
        id: 2,
        type: "ofertë",
        tag: "-10%",
        title: "10% Zbritje për Klientët e Rinj",
        desc: "Porosia juaj e parë me 10% më lirë. Vlen për të gjitha produktet dhe madhësitë.",
        image: "https://images.unsplash.com/photo-1513171920216-2640b288471b?w=500",
        date: "Ofertë e vazhdueshme",
        couponCode: "LASER10"
    },
    {
        id: 3,
        type: "ofertë",
        tag: "€5",
        title: "€5 Zbritje Mirëseardhje",
        desc: "Zbritje fikse prej €5 në çdo porosi mbi €20. Ideale për dhurata të vogla.",
        image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500",
        date: "Ofertë e vazhdueshme",
        couponCode: "WELCOME5"
    },
    {
        id: 4,
        type: "lajm",
        tag: "E RE",
        title: "Personalizim Interaktiv në Aplikacion",
        desc: "Tani mund të dizajnoni produktin tuaj direkt në aplikacion, me foto dhe tekst personal, para se ta porositni.",
        image: "https://images.unsplash.com/photo-1516387938699-a93567ec168e?w=500",
        date: "Njoftim i fundit",
        couponCode: null
    },
    {
        id: 5,
        type: "lajm",
        tag: "NJOFTIM",
        title: "Koha e Dërgesës u Shkurtua",
        desc: "Falë investimit në pajisje të reja lazer, tani shumica e porosive gatishen brenda 1-2 ditësh.",
        image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500",
        date: "Njoftim i fundit",
        couponCode: null
    }
];

const KEY = 'laserdesign_offers';

export default async function handler(req, res) {
    try {
        if (req.method === 'GET') {
            let offers = await kv.get(KEY);
            if (!offers) {
                offers = INITIAL_OFFERS;
                await kv.set(KEY, offers);
            }
            return res.status(200).json(offers);
        }

        if (req.method === 'PUT') {
            const offers = req.body;
            if (!Array.isArray(offers)) {
                return res.status(400).json({ error: 'Kërkohet një listë (array) ofertash.' });
            }
            await kv.set(KEY, offers);
            return res.status(200).json({ ok: true });
        }

        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).json({ error: `Metoda ${req.method} nuk lejohet.` });
    } catch (err) {
        return res.status(500).json({ error: 'Gabim në server: ' + err.message });
    }
}
