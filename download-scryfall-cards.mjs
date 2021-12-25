import fs from 'fs';
import axios from 'axios';
import { strict as assert } from 'assert';
import { normalizeCardName } from './src/helpers/CardNames.mjs';

if (!fs.existsSync('./data/default-cards.json')) {
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
];

const customPromoSets = [
    'plist', // The List.
    'mb1', // Specifically non-Playtest card Mystery Booster inclusions.
    'sum', // Summer Magic.
];

const customNotPromoSets = [
    'phpr'
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
    return !card.oversized
        && !excludedSetTypes.includes(card.set_type)
        && !excludedLayouts.includes(card.layout)
        && !excludedSets.includes(card.set);
}).flatMap(card => {
    // Do some handling for the stupid Reversible Card bullshit.
    if (card.layout === 'reversible_card') {
        return [
            { ...card, ...card.card_faces[0], collector_number: `${card.collector_number}a`, card_faces: undefined },
            { ...card, ...card.card_faces[1], collector_number: `${card.collector_number}b`, card_faces: undefined },
        ];
    }

    return [ card ];
}).map(card => {
    // Then set the high level data necessary to organize the remaining cards.
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
        setNumber: card.collector_number,
        isDigital: card.digital,
        isPromo: !customNotPromoSets.includes(card.set) && (card.promo || card.promo_types || customPromoSetTypes.includes(card.set_type) || customPromoSets.includes(card.set)),
        imageUris: {
            front: card.card_faces?.[0]?.image_uris?.border_crop ?? card.image_uris?.border_crop,
            back: card.card_faces?.[1]?.image_uris?.border_crop ?? undefined,
        }
    };
});

stripped.push({
    name: 'griselbrand',
    releaseDate: '1990-01-01',
    set: {
        name: 'Griselbrand.com',
        code: 'Griselbrand.com',
    },
    setNumber: '1',
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
    if (Date.parse(a.releaseDate) === Date.parse(b.releaseDate)) {
        return a.setNumber <= b.setNumber ? -1 : 1;
    }

    return Date.parse(a.releaseDate) < Date.parse(b.releaseDate) ? -1 : 1;
}).reduce((store, card) => {
    // And take that and tighten it down as much as possible.
    // Need to look into gzip more, it might be possible to leave full urls if they get properly compressed out.
    const name = card.name.toLowerCase();
    store.cards[name] = store.cards[name] || [];
    store.cards[name].push({
        s: `${card.set.code}|${card.setNumber}`,
        d: card.isDigital ? 1 : undefined,
        p: card.isPromo ? 1 : undefined,

        // Scryfall puts a timestamp query param on these, which we don't need as it'll trigger a full regeneration each week.
        // GZip seems to be doing a good job of optimizing out all the duplicate cdn url prefixes, so I guess it's okay to not over optimize.
        f: card.imageUris.front?.replace(/\?.*/, ''),
        b: card.imageUris.back?.replace(/\?.*/, ''),
    });

    store.sets[card.set.code] = card.set.name;

    return store;
}, { cards: {}, sets: {} });

console.log(`Found ${Object.keys(minimized.cards).length} cards from ${Object.keys(minimized.sets).length} sets.`);

// Run some basic sanity tests.
assert.equal(minimized.cards['abandon hope']?.length, 1);
assert.equal(minimized.cards['abandon hope']?.[0].s, 'tmp|107');
assert.match(minimized.cards['abandon hope']?.[0].f, /scryfall\.com.*\.jpg$/);

assert.equal(minimized.cards['lightning dragon']?.length, 4);
assert.equal(minimized.cards['lightning dragon']?.[0].s, 'pusg|202');
assert.equal(minimized.cards['lightning dragon']?.[1].s, 'usg|202');
assert.equal(minimized.cards['lightning dragon']?.[2].s, 'prm|32196');
assert.equal(minimized.cards['lightning dragon']?.[3].s, 'vma|177');
assert.equal(minimized.cards['lightning dragon']?.[0].d, undefined);
assert.equal(minimized.cards['lightning dragon']?.[1].d, undefined);
assert.equal(minimized.cards['lightning dragon']?.[2].d, 1);
assert.equal(minimized.cards['lightning dragon']?.[3].d, 1);
assert.equal(minimized.cards['lightning dragon']?.[0].p, 1);
assert.equal(minimized.cards['lightning dragon']?.[1].p, undefined);
assert.equal(minimized.cards['lightning dragon']?.[2].p, 1);
assert.equal(minimized.cards['lightning dragon']?.[3].p, undefined);

assert.equal(minimized.sets['tmp'], 'Tempest');

assert(Object.keys(minimized.cards).length > 20000);
assert(Object.keys(minimized.sets).length > 500);

// fs.writeFileSync('./min-pretty.json', JSON.stringify(minimized, null, 2));
fs.writeFileSync('./data/cards-minimized.json', JSON.stringify(minimized, null, 2));

console.log('Finished writing minimized card list.');
