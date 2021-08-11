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
    return !excludedSetTypes.includes(card.set_type)
        && !excludedLayouts.includes(card.layout)
        && !excludedSets.includes(card.set);
}).map(card => {
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

// fs.writeFileSync('./out.json', JSON.stringify(stripped, null, 2));

const minimized = stripped.sort((a, b) => {
    return Date.parse(a.releaseDate) <= Date.parse(b.releaseDate) ? -1 : 1;
}).reduce((store, card) => {
    const name = card.name.toLowerCase();
    store.cards[name] = store.cards[name] || [];
    store.cards[name].push({
        s: `${card.set.code}|${card.setNumber}`,
        d: card.isDigital ? 1 : undefined,
        p: card.isPromo ? 1 : undefined,
        f: card.imageUris.front?.replace(/\?.*/, '').replace('https://c1.scryfall.com/file/scryfall-cards/border_crop/front/', ''),
        b: card.imageUris.back?.replace(/\?.*/, '').replace('https://c1.scryfall.com/file/scryfall-cards/border_crop/back/', ''),
    });

    store.sets[card.set.code] = card.set.name;

    return store;
}, { cards: {}, sets: {} });

assert.equal(minimized.cards['abandon hope']?.length, 1);
assert.equal(minimized.cards['abandon hope']?.[0].s, 'tmp|107');
assert.match(minimized.cards['abandon hope']?.[0].f, /^((?!scryfall\.com).)*\.jpg$/);

assert.equal(minimized.sets['tmp'], 'Tempest');

// I think the next major minimization that could be done would have to be with the set names.
// Could alias those and pull them out to a seperate file for mapping against. Saves 880kb pre-whitespace stripping.
// fs.writeFileSync('./min-pretty.json', JSON.stringify(minimized, null, 2));
fs.writeFileSync('./data/cards-minimized.json', JSON.stringify(minimized, null, 2));

console.log('Finished writing minimized card list.');
// 4072kb with `code number`
// 4453kb with s, n
// 4938kb with `name (number)`
