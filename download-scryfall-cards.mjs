import fs from 'fs';
import axios from 'axios';
import { strict as assert } from 'assert';
import { normalizeCardName } from './src/helpers/CardNames.mjs';

if (!fs.existsSync('./data/default-cards.json') || process.argv[2] == "--update") {
    console.log('Downloading fresh card data.');
    const bulkResp = await axios.get('https://api.scryfall.com/bulk-data');

    const defaultCardsBulk = bulkResp.data.data.find(bulkObject => {
        return bulkObject.type === 'default_cards';
    });

    console.log(`Download uri: ${defaultCardsBulk.download_uri}`);

    const dataResp = await axios({
        url: `${defaultCardsBulk.download_uri}`,
        method: 'GET',
        responseType: 'stream',
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

const excludedSets = [
    'fbb',
    '4bb',
    'rin',
    'ren',
];

const excludedSetTypes = [
    'token',
];

const excludedLayouts = [
    'token',
    'double_faced_token',
    'art_series',
];

const stripped = cards.filter(card => {
    // Process the exclusions.
    return includedSets.includes(card.set) ||
        ((!card.oversized || card.layout === 'planar')
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
        name: normalizeCardName(card.card_faces?.[0]?.image_uris ? card.card_faces[0].name : card.name),
        releaseDate: card.released_at,
        set: {
            name: card.set_name,
            code: card.set,
        },
        collectorNumber: card.overridden_collector_number ?? card.collector_number,
        isDigital: card.digital,
        isPromo: !customNotPromoSets.includes(card.set) && (card.promo || card.promo_types || customPromoSetTypes.includes(card.set_type) || customPromoSets.includes(card.set)),
        imageUris: {
            front: `https://api.scryfall.com/cards/${card.set}/${card.collector_number}?format=image&face=${card.reversible_face ?? 'front'}`,
            back: cardBackUri,
        },
    };
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
    if (Date.parse(a.releaseDate) === Date.parse(b.releaseDate)) {
        const aInt = parseInt(a.collectorNumber.replace(/[^0-9]/, ''));
        const bInt = parseInt(b.collectorNumber.replace(/[^0-9]/, ''));

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
assert.equal(minimized.cards['abandon hope']?.length, 1);
assert.equal(minimized.cards['abandon hope']?.[0].setCode, 'tmp');
assert.equal(minimized.cards['abandon hope']?.[0].collectorNumber, '107');
assert.match(minimized.cards['abandon hope']?.[0].urlFront, /api\.scryfall\.com.*$/);

assert.equal(minimized.cards['lightning dragon']?.length, 4);
assert.equal(minimized.cards['lightning dragon']?.[0].setCode, 'pusg');
assert.equal(minimized.cards['lightning dragon']?.[0].collectorNumber, '202');
assert.equal(minimized.cards['lightning dragon']?.[1].setCode, 'usg');
assert.equal(minimized.cards['lightning dragon']?.[1].collectorNumber, '202');
assert.equal(minimized.cards['lightning dragon']?.[2].setCode, 'prm');
assert.equal(minimized.cards['lightning dragon']?.[2].collectorNumber, '32196');
assert.equal(minimized.cards['lightning dragon']?.[3].setCode, 'vma');
assert.equal(minimized.cards['lightning dragon']?.[3].collectorNumber, '177');
assert.equal(minimized.cards['lightning dragon']?.[0].isDigital, undefined);
assert.equal(minimized.cards['lightning dragon']?.[1].isDigital, undefined);
assert.equal(minimized.cards['lightning dragon']?.[2].isDigital, true);
assert.equal(minimized.cards['lightning dragon']?.[3].isDigital, true);
assert.equal(minimized.cards['lightning dragon']?.[0].isPromo, true);
assert.equal(minimized.cards['lightning dragon']?.[1].isPromo, undefined);
assert.equal(minimized.cards['lightning dragon']?.[2].isPromo, true);
assert.equal(minimized.cards['lightning dragon']?.[3].isPromo, undefined);

assert.equal(minimized.sets['tmp'], 'Tempest');

assert(Object.keys(minimized.cards).length > 20000);
assert(Object.keys(minimized.sets).length > 500);

// fs.writeFileSync('./min-pretty.json', JSON.stringify(minimized, null, 2));
fs.writeFileSync('./data/cards-minimized.json', JSON.stringify(minimized, null, 2));

console.log('Finished writing minimized card list.');
