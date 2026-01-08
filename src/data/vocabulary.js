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

    // New Additions
    { id: 31, term: "der Kaffee", translation: "de koffie", category: "general" },
    { id: 32, term: "möchten", translation: "willen/zouden graag", category: "actions" },
    { id: 33, term: "die Visitenkarte", translation: "het visitekaartje", category: "business" },
    { id: 34, term: "der Katalog", translation: "de catalogus", category: "business" },
    { id: 35, term: "die Maschen", translation: "de steken", category: "materials" },
    { id: 36, term: "fest", translation: "strak/vast", category: "materials" },
    { id: 37, term: "weich", translation: "zacht", category: "materials" },
    { id: 38, term: "die Farbe", translation: "de kleur", category: "materials" },
    { id: 39, term: "ausverkauft", translation: "uitverkocht", category: "business" },
    { id: 40, term: "das Angebot", translation: "de aanbieding/offerte", category: "business" },
    { id: 41, term: "bezahlen", translation: "betalen", category: "actions" },
    { id: 42, term: "bar", translation: "contant", category: "business" },
    { id: 43, term: "mit Karte", translation: "met kaart", category: "business" },
    { id: 44, term: "helfen", translation: "helpen", category: "actions" },
    { id: 45, term: "die Fragen", translation: "de vragen", category: "general" },
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
                translation: "Hartelijk welkom bij onze stand!",
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
                translation: "Ja natuurlijk, hier zijn ze.",
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
                translation: "Het zijn de meest unieke dieren ter wereld.",
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
                translation: "Dat is mozaïek-haken.",
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
                translation: "Ik beveel de set 'Boerin en kippen' aan.",
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
                translation: "Nee, de handleiding is heel duidelijk.",
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
                translation: "Ja, dat hangt af van de hoeveelheid.",
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
                translation: "We kunnen binnen een week leveren.",
                expected: ["Woche", "Tage", "liefern", "schnell"],
                hint: "Wir können innerhalb einer Woche liefern.",
            }
        ]
    },
    {
        id: "smalltalk_coffee",
        title: "Koffie & Contact",
        description: "Breek het ijs met een praatje en wissel gegevens uit.",
        steps: [
            {
                speaker: "bot",
                text: "Das ist ein sehr schöner Stand. Haben Sie viel zu tun?",
                translation: "Dat is een erg mooie stand. Heeft u het druk?"
            },
            {
                speaker: "user",
                translation: "Ja, hartstikke druk! Wilt u een koffie?",
                expected: ["ja", "viel", "tun", "Kaffee", "möchten"],
                hint: "Ja, sehr viel zu tun! Möchten Sie einen Kaffee?",
            },
            {
                speaker: "bot",
                text: "Gerne, danke! Haben Sie eine Visitenkarte?",
                translation: "Graag, bedankt! Heeft u een visitekaartje?"
            },
            {
                speaker: "user",
                translation: "Natuurlijk, hier is mijn visitekaartje.",
                expected: ["natürlich", "hier", "Visitenkarte"],
                hint: "Natürlich, hier ist meine Visitenkarte.",
            }
        ]
    },
    {
        id: "payment_process",
        title: "Betalen op de beurs",
        description: "Handel een verkoop af bij de kassa.",
        steps: [
            {
                speaker: "bot",
                text: "Ich nehme dieses Häkelset. Kann ich mit Karte bezahlen?",
                translation: "Ik neem dit haakpakket. Kan ik met kaart betalen?"
            },
            {
                speaker: "user",
                translation: "Ja, dat kan. Dat is dan twintig euro alstublieft.",
                expected: ["ja", "möglich", "zwanzig", "Euro", "bitte"],
                hint: "Ja, das ist möglich. Das macht zwanzig Euro bitte.",
            },
            {
                speaker: "bot",
                text: "Hier bitte. Bekomme ik een factuur?",
                translation: "Alstublieft. Krijg ik een factuur?"
            },
            {
                speaker: "user",
                translation: "Zeker, ik stuur de factuur per e-mail.",
                expected: ["sicher", "rechnung", "senden", "E-Mail"],
                hint: "Sicher, ich sende die Rechnung per E-Mail.",
            }
        ]
    },
    {
        id: "technical_deepdive",
        title: "Techniek & Materiaal",
        description: "Ga dieper in op het materiaal en de steken.",
        steps: [
            {
                speaker: "bot",
                text: "Ist das Garn aus reiner Baumwolle?",
                translation: "Is het garen van pure katoen?"
            },
            {
                speaker: "user",
                translation: "Ja, het is honderd procent katoen en heel zacht.",
                expected: ["ja", "hundert", "prozent", "Baumwolle", "weich"],
                hint: "Ja, es ist hundert prozent Baumwolle und sehr weich.",
            },
            {
                speaker: "bot",
                text: "Muss man sehr fest häkeln für diese Tiere?",
                translation: "Moet je erg strak haken voor deze dieren?"
            },
            {
                speaker: "user",
                translation: "Ja, strak haken is belangrijk voor Amigurumi.",
                expected: ["ja", "fest", "häkeln", "wichtig", "Amigurumi"],
                hint: "Ja, fest häkeln ist wichtig für Amigurumi.",
            }
        ]
    }
];
