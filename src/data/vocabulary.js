export const categories = {
    general: "Algemeen",
    materials: "Materialen",
    actions: "Acties",
    animals: "Dieren (Amigurumi)",
    products: "Producten & Sets",
    business: "Zakelijk & Beurs"
};

export const vocabulary = [
    // General / Trade Fair
    { id: 1, term: "die Messe", translation: "de beurs", category: "general" },
    { id: 2, term: "der Stand", translation: "de stand", category: "general" },
    { id: 3, term: "herzlich willkommen", translation: "hartelijk welkom", category: "general" },
    { id: 4, term: "Guten Tag", translation: "goedendag", category: "general" },

    // Materials / Crochet
    { id: 5, term: "das Garn", translation: "het garen", category: "materials" },
    { id: 6, term: "die Häkelnadel", translation: "de haaknaald", category: "materials" },
    { id: 7, term: "die Wolle", translation: "de wol", category: "materials" },
    { id: 8, term: "die Baumwolle", translation: "het katoen", category: "materials" },
    { id: 9, term: "das Muster", translation: "het patroon", category: "materials" },
    { id: 10, term: "die Anleitung", translation: "de handleiding/patroon", category: "materials" },
    { id: 11, term: "Mosaik-Häkeln", translation: "mozaïek haken", category: "materials" },

    // Actions
    { id: 12, term: "häkeln", translation: "haken", category: "actions" },
    { id: 13, term: "stricken", translation: "breien", category: "actions" },
    { id: 14, term: "kaufen", translation: "kopen", category: "actions" },
    { id: 15, term: "bestellen", translation: "bestellen", category: "actions" },
    { id: 16, term: "liefern", translation: "leveren", category: "actions" },

    // Animals (Amigurumi) - YarnZoo Classics
    { id: 17, term: "das Wasserschwein", translation: "de capybara", category: "animals" },
    { id: 18, term: "die Schildkröte", translation: "de schildpad", category: "animals" },
    { id: 19, term: "die Giraffe", translation: "de giraffe", category: "animals" },
    { id: 20, term: "der Bär", translation: "de beer", category: "animals" },
    { id: 21, term: "das Huhn", translation: "de kip", category: "animals" },
    { id: 22, term: "der Wal", translation: "de walvis", category: "animals" },

    // Products
    { id: 23, term: "das Häkelbuch", translation: "het haakboek", category: "products" },
    { id: 24, term: "das Häkelset", translation: "het haakpakket", category: "products" },
    { id: 25, term: "Tiere der Welt", translation: "Dieren van de wereld (collectie)", category: "products" },
    { id: 26, term: "Bäuerin und Hühner", translation: "Boerinnen en kippen (set)", category: "products" },

    // Business
    { id: 27, term: "der Großhändler", translation: "de groothandel", category: "business" },
    { id: 28, term: "die Lieferzeit", translation: "de levertijd", category: "business" },
    { id: 29, term: "der Rabatt", translation: "de korting", category: "business" },
    { id: 30, term: "die Rechnung", translation: "de factuur", category: "business" },
];

export const scenarios = [
    {
        id: "greeting",
        title: "Begroeting op de stand",
        description: "Oefen hoe je een bezoeker welkom heet.",
        steps: [
            {
                speaker: "bot",
                text: "Hallo! Schöne Wolle haben Sie hier.",
                translation: "Hallo! Mooie wol heeft u hier."
            },
            {
                speaker: "user",
                expected: ["willkommen", "stand", "danke", "hallo"],
                hint: "Herzlich willkommen an unserem Stand!",
            },
            {
                speaker: "bot",
                text: "Haben Sie auch Häkelnadeln?",
                translation: "Heeft u ook haaknaalden?"
            },
            {
                speaker: "user",
                expected: ["ja", "natürlich", "haben", "hier"],
                hint: "Ja natürlich, hier sind sie.",
            }
        ]
    },
    {
        id: "yarn_quality",
        title: "Uitleg Amigurumi & Mozaïek",
        description: "Leg uit wat YarnZoo uniek maakt (dieren & techniek).",
        steps: [
            {
                speaker: "bot",
                text: "Was ist das Besondere an Ihren Tieren?",
                translation: "Wat is er bijzonder aan uw dieren?"
            },
            {
                speaker: "user",
                expected: ["Tiere", "Welt", "einzigartig", "Amigurumi"],
                hint: "Es sind die einzigartigsten Tiere der Welt.",
            },
            {
                speaker: "bot",
                text: "Und was ist das für eine Technik?",
                translation: "En wat is dat voor een techniek?"
            },
            {
                speaker: "user",
                expected: ["Mosaik", "Häkeln", "Technik"],
                hint: "Das ist Mosaik-Häkeln.",
            }
        ]
    },
    {
        id: "products_sales",
        title: "Verkoop: Boeken & Sets",
        description: "Verkoop specifieke producten zoals 'Bäuerin und Hühner'.",
        steps: [
            {
                speaker: "bot",
                text: "Ich suche ein Geschenk für meine Enkelin.",
                translation: "Ik zoek een cadeau voor mijn kleindochter."
            },
            {
                speaker: "user",
                expected: ["Set", "Bäuerin", "Hühner", "beliebt", "empfehlen"],
                hint: "Ich empfehle das Set Bäuerin und Hühner.",
            },
            {
                speaker: "bot",
                text: "Ist das schwierig zu machen?",
                translation: "Is dat moeilijk om te maken?"
            },
            {
                speaker: "user",
                expected: ["nein", "Anleitung", "einfach", "klar"],
                hint: "Nein, die Anleitung ist sehr klar.",
            }
        ]
    },
    {
        id: "negotiation",
        title: "B2B: Prijs & Levering",
        description: "Oefen een zakelijk gesprek met een winkelier.",
        steps: [
            {
                speaker: "bot",
                text: "Wir möchten Ihre Bücher in unserem Laden verkaufen. Bekommen wir einen Rabatt?",
                translation: "We willen uw boeken verkopen. Krijgen we korting?"
            },
            {
                speaker: "user",
                expected: ["ja", "Menge", "abhängig", "Rabatt"],
                hint: "Ja, das hängt von der Menge ab.",
            },
            {
                speaker: "bot",
                text: "Verstehe. Und wie lange ist die Lieferzeit?",
                translation: "Begrepen. En wat is de levertijd?"
            },
            {
                speaker: "user",
                expected: ["Woche", "Tage", "liefern", "schnell"],
                hint: "Wir können innerhalb einer Woche liefern.",
            }
        ]
    }
];
