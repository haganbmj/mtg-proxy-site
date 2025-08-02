import fs from 'fs';
import axios from 'axios';
import { strict as assert } from 'assert';
import { normalizeCardName } from './src/helpers/CardNames.mjs';

if (!fs.existsSync('./data/default-cards.json') || process.argv[2] == "--update") {
    console.log('Downloading fresh card data.');

    const dataResp = await axios({
        url: `https://api.scryfall.com/bulk-data/default-cards?format=file`,
        method: 'GET',
        responseType: 'stream',
        headers: {
            'User-Agent': 'Griselbrand/0.1.0',
        },
    });

    const write = fs.createWriteStream('./data/default-cards.json');
    dataResp.data.pipe(write);
    await new Promise((res, rej) => {
        write.on('finish', res);
        write.on('error', rej);
    });

    console.log('Finished piping results to file.');
} else {
    console.log('Using existing card data.');
}

const cards = JSON.parse(fs.readFileSync('./data/default-cards.json'));

const customPromoSetTypes = [
    'from_the_vault',
    'spellbook',
    'memorabilia', // Includes World Champs decks and CE/IE.
    'box', // Includes all Secret Lairs.
    'duel_deck',
    'premium_deck',
    'masterpiece',
];

const customPromoSets = [
    'plist', // The List.
    'mb1', // Specifically non-Playtest card Mystery Booster inclusions.
    'sum', // Summer Magic.
];

const customNotPromoSets = [
    'phpr',
];

const includedSets = [
    'sunf', // Unfinity Sticker Sheets.
];

const includedOversizeLayouts = [
    'planar',
    'scheme',
    'vanguard',
];

const excludedSets = [
    'fbb',
    '4bb',
    'rin',
    'ren',
];

const excludedSetTypes = [

];

const excludedLayouts = [
    'art_series',
];

const stripped = cards.filter(card => {
    // Process the exclusions.
    return includedSets.includes(card.set) ||
        ((!card.oversized || includedOversizeLayouts.includes(card.layout))
        && !excludedSetTypes.includes(card.set_type)
        && !excludedLayouts.includes(card.layout)
        && !excludedSets.includes(card.set));
}).flatMap(card => {
    // Do some handling for the stupid Reversible Card bullshit.
    if (card.layout === 'reversible_card') {
        return [
            { ...card, ...card.card_faces[0], collector_number: card.collector_number, card_faces: undefined, overridden_collector_number: `${card.collector_number}a`, reversible_face: 'front' },
            { ...card, ...card.card_faces[1], collector_number: card.collector_number, card_faces: undefined, overridden_collector_number: `${card.collector_number}b`,reversible_face: 'back' },
        ];
    }

    return [ card ];
}).map(card => {
    // Then set the high level data necessary to organize the remaining cards.
    var cardBackUri = undefined;
    if (card.card_faces?.[1]?.image_uris) {
        cardBackUri = `https://api.scryfall.com/cards/${card.set}/${card.collector_number}?format=image&face=back`;
    } else if (card.layout == 'meld') {
        cardBackUri = `https://backs.scryfall.io/large/${card.card_back_id.charAt(0)}/${card.card_back_id.charAt(1)}/${card.card_back_id}.jpg`;
    }

    return {
        id: card.id,
        oracleId: card.oracle_id,
        oracleName: card.name,
        name: normalizeCardName(card.name),
        releaseDate: card.released_at,
        set: {
            name: card.set_name,
            code: card.set,
        },
        collectorNumber: card.overridden_collector_number ?? card.collector_number,
        isDigital: card.digital,
        isPromo: !customNotPromoSets.includes(card.set) && (card.promo || card.promo_types || customPromoSetTypes.includes(card.set_type) || customPromoSets.includes(card.set)),
        isToken: card.layout === 'token' || card.layout === 'double_faced_token',
        imageUris: {
            front: `https://api.scryfall.com/cards/${card.set}/${card.collector_number}?format=image&face=${card.reversible_face ?? 'front'}`,
            back: cardBackUri,
        },
    };
}).flatMap(card => {
    // Create two entries for any adventure/dfc to allow for both naming conventions.
    // A more compact option would be to create some alias map, but this is simpler.
    if (card.name.includes(" // ")) {
        return [
            card,
            { ...card, name: card.name.split(" // ")[0] },
        ]
    }

    return [ card ];
});

stripped.push({
    name: 'griselbrand',
    releaseDate: '1990-01-01',
    set: {
        name: 'Griselbrand.com',
        code: 'Griselbrand.com',
    },
    collectorNumber: '1',
    isDigital: false,
    isPromo: false,
    imageUris: {
        front: '/avr-106-griselbrand.jpg',
    },
});

// fs.writeFileSync('./out.json', JSON.stringify(stripped, null, 2));

const minimized = stripped.sort((a, b) => {
    // From there organize everything by release date in reverse chronological order.
    // In the event of multiple printings from the same set (basics) sort by set number.
    // Collector Numbers aren't actually numeric, becuase we can have A/B/C variants.
    // So we have to strip the non-numeric characters, compare those, then fallback to the alpha comparisons.
    // Without this we get into situations where 218a < 60 can happen with alt arts and such.
    // But this doesn't handle The List, which uses a reference back to the original printing (eg. PLST MM2-42), so the split+pop is to account for that.
    if (Date.parse(a.releaseDate) === Date.parse(b.releaseDate)) {
        const aInt = parseInt(a.collectorNumber.split('-').pop().replace(/[^0-9]/, ''));
        const bInt = parseInt(b.collectorNumber.split('-').pop().replace(/[^0-9]/, ''));

        if (aInt == bInt) {
            return a.collectorNumber <= b.collectorNumber ? -1 : 1;
        } else {
            return aInt <= bInt ? -1 : 1;
        }
    }

    return Date.parse(a.releaseDate) < Date.parse(b.releaseDate) ? -1 : 1;
}).reduce((store, card) => {
    try {
        // And take that and tighten it down as much as possible.
        const name = card.name.toLowerCase();
        store.cards[name] = store.cards[name] || [];
        store.cards[name].push({
            setCode: card.set.code,
            collectorNumber: card.collectorNumber,
            isDigital: card.isDigital ? true : undefined,
            isPromo: card.isPromo ? true : undefined,
            isToken: card.isToken ? true : undefined,

            urlFront: card.imageUris.front,
            urlBack: card.imageUris.back,
        });

        store.sets[card.set.code] = card.set.name;

        return store;
    } catch (e) {
        console.log(`Failure during card: ${JSON.stringify(card)}`, e);
        throw e;
    }
}, { cards: {}, sets: {} });

console.log(`Found ${Object.keys(minimized.cards).length} distinct cards from ${Object.keys(minimized.sets).length} sets.`);

// Run some basic sanity tests.
// FIXME: Replace this test with a card that isn't likely to get a reprint.
assert.deepStrictEqual(
    minimized.cards["toralf, god of fury // toralf's hammer"],
    [
        {
            "setCode": "khm",
            "collectorNumber": "154",
            "isDigital": undefined,
            "isPromo": undefined,
            "isToken": undefined,
            "urlFront": "https://api.scryfall.com/cards/khm/154?format=image&face=front",
            "urlBack": "https://api.scryfall.com/cards/khm/154?format=image&face=back",
          },
          {
            "setCode": "pkhm",
            "collectorNumber": "154s",
            "isDigital": undefined,
            "isPromo": true,
            "isToken": undefined,
            "urlFront": "https://api.scryfall.com/cards/pkhm/154s?format=image&face=front",
            "urlBack": "https://api.scryfall.com/cards/pkhm/154s?format=image&face=back",
          },
          {
            "setCode": "khm",
            "collectorNumber": "313",
            "isDigital": undefined,
            "isPromo": true,
            "isToken": undefined,
            "urlFront": "https://api.scryfall.com/cards/khm/313?format=image&face=front",
            "urlBack": "https://api.scryfall.com/cards/khm/313?format=image&face=back",
          },
          {
            "setCode": "prm",
            "collectorNumber": "88302",
            "isDigital": true,
            "isPromo": true,
            "isToken": undefined,
            "urlFront": "https://api.scryfall.com/cards/prm/88302?format=image&face=front",
            "urlBack": "https://api.scryfall.com/cards/prm/88302?format=image&face=back",
          },
    ],
);

assert.equal(
    minimized.sets['plc'],
    'Planar Chaos',
);

// fs.writeFileSync('./min-pretty.json', JSON.stringify(minimized, null, 2));
fs.writeFileSync('./data/cards-minimized.json', JSON.stringify(minimized, null, 2));

console.log('Finished writing minimized card list.');
