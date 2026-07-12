// products.js

const INITIAL_PRODUCTS = [
    {
        id: 1,
        title: "Orë Muri me Gravurë",
        price: 25.00, // Çmimi bazë për madhësinë më të vogël (30x30 cm)
        category: "shtëpi",
        image: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=500",
        desc: "Orë muri unike e punuar nga druri i dushkut me detaje precize me lazer. Çmimi ndryshon sipas madhësisë së zgjedhur.",
        sizes: ["30x30 cm", "40x40 cm", "50x50 cm"],
        // Çmimet e specifikuara për çdo madhësi (sa më e madhe, aq më shtrenjtë)
        sizePrices: {
            "30x30 cm": 25.00,
            "40x40 cm": 35.00,
            "50x50 cm": 48.00
        },
        time: "1-2 ditë",
        ratingsList: [5, 5, 4, 5]
    },
    {
        id: 2,
        title: "Kuti Dhuratash Personale",
        price: 15.00, // Çmimi bazë për madhësinë 20x15 cm
        category: "dhurata",
        image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=500",
        desc: "Kuti druri ideale për dhurata, me mundësi gdhendjeje të emrit tuaj. Çmimi ndryshon sipas madhësisë së zgjedhur.",
        sizes: ["20x15 cm", "30x20 cm"],
        // Çmimet e specifikuara për çdo madhësi
        sizePrices: {
            "20x15 cm": 15.00,
            "30x20 cm": 22.00
        },
        time: "1 ditë",
        ratingsList: [4, 4, 5, 3]
    },
    {
        id: 3,
        title: "Logo Biznesi në Dru",
        price: 45.00, // Çmimi bazë për madhësinë 40x30 cm
        category: "biznes",
        image: "https://images.unsplash.com/photo-1542744094-2ab25be78b90?w=500",
        desc: "Tabela profesionale me logon e biznesit tuaj për zyrë ose ambient të jashtëm. Çmimi ndryshon sipas madhësisë.",
        sizes: ["40x30 cm", "50x40 cm", "70x50 cm"],
        // Çmimet e specifikuara për çdo madhësi
        sizePrices: {
            "40x30 cm": 45.00,
            "50x40 cm": 65.00,
            "70x50 cm": 95.00
        },
        time: "2-3 ditë",
        ratingsList: [5, 5, 5]
    }
];

/**
 * Funksion ndihmës për të llogaritur çmimin e saktë të një produkti të dyqanit
 * bazuar në madhësinë e përzgjedhur nga klienti.
 * * @param {Object} product - Objekti i produktit nga lista
 * @param {string} selectedSize - Madhësia e zgjedhur (psh. "40x40 cm")
 * @return {number} Çmimi përfundimtar i produktit për atë madhësi
 */
function getProductPriceBySize(product, selectedSize) {
    if (product.sizePrices && product.sizePrices[selectedSize]) {
        return product.sizePrices[selectedSize];
    }
    return product.price; // Kthen çmimin bazë nëse nuk gjendet madhësia
}