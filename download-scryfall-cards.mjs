import fs from 'fs';
import axios from 'axios';
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
];

const customPromoSets = [
    'plist', // The List.
    'mb1', // Specifically non-Playtest card Mystery Booster inclusions.
    'sum', // Summer Magic.
];

const customExcludedSets = [
    'fbb',
    '4bb',
    'rin',
]

const stripped = cards.filter(card => {
    return card.set_type !== 'token' && card.layout !== 'token' && card.layout !== 'double_faced_token' && !customExcludedSets.includes(card.set);
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
        isPromo: card.promo || card.promo_types || customPromoSetTypes.includes(card.set_type) || customPromoSets.includes(card.set),
        imageUris: {
            front: card.card_faces?.[0]?.image_uris?.border_crop ?? card.image_uris.border_crop,
            back: card.card_faces?.[1]?.image_uris?.border_crop ?? undefined,
        }
    };
});

// fs.writeFileSync('./out.json', JSON.stringify(stripped, null, 2));

const minimized = stripped.sort((a, b) => {
    return Date.parse(a.releaseDate) <= Date.parse(b.releaseDate) ? -1 : 1;
}).reduce((store, card) => {
    const name = card.name.toLowerCase();
    store[name] = store[name] || [];
    store[name].push({
        s: `${card.set.name} (${card.setNumber})`,
        d: card.isDigital ? 'y' : undefined,
        p: card.isPromo ? 'y' : undefined,
        f: card.imageUris.front.replace(/\?.*/, '').replace('https://c1.scryfall.com/file/scryfall-cards/border_crop/front/', ''),
        b: card.imageUris.back?.replace(/\?.*/, '').replace('https://c1.scryfall.com/file/scryfall-cards/border_crop/back/', ''),
    });

    return store;
}, {});

// I think the next major minimization that could be done would have to be with the set names.
// Could alias those and pull them out to a seperate file for mapping against. Saves 880kb pre-whitespace stripping.
// fs.writeFileSync('./min-pretty.json', JSON.stringify(minimized, null, 2));
fs.writeFileSync('./data/cards-minimized.json', JSON.stringify(minimized, null, 2));

console.log('Finished writing minimized card list.');
// 4072kb with `code number`
// 4453kb with s, n
// 4938kb with `name (number)`
