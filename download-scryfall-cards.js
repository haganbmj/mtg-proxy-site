const fs = require('fs');
const cards = require('./default-cards.json');

const stripped = cards.filter(card => {
    return card.set_type !== 'token';
}).map(card => {
    return {
        id: card.id,
        oracleId: card.oracle_id,
        oracleName: card.name,
        name: card.card_faces?.[0]?.image_uris ? card.card_faces[0].name : card.name,
        releaseDate: card.released_at,
        set: {
            name: card.set_name,
            code: card.set,
        },
        setNumber: card.collector_number,
        isDigital: card.digital,
        imageUris: {
            front: card.card_faces?.[0]?.image_uris?.normal ?? card.image_uris.normal,
            back: card.card_faces?.[1]?.image_uris?.normal ?? undefined,
        }
    };
});

fs.writeFileSync('./out.json', JSON.stringify(stripped, null, 2));

const minimized = stripped.sort((a, b) => {
    return Date.parse(a.releaseDate) <= Date.parse(b.releaseDate) ? -1 : 1;
}).reduce((store, card) => {
    const name = card.name.toLowerCase();
    store[name] = store[name] || [];
    store[name].push({
        s: `${card.set.name} (${card.setNumber})`,
        // s: card.set.name,
        // s: `${card.set.code} ${card.setNumber}`,
        // s: card.set.code,
        // n: card.setNumber,
        d: card.isDigital ? 'y' : undefined,
        f: card.imageUris.front.replace(/\?.*/, '').replace('https://c1.scryfall.com/file/scryfall-cards/normal/front/', ''),
        b: card.imageUris.back?.replace(/\?.*/, '').replace('https://c1.scryfall.com/file/scryfall-cards/normal/back/', ''),
    });

    return store;
}, {});

// I think the next major minimization that could be done would have to be with the set names.
// Could alias those and pull them out to a seperate file for mapping against. Saves 880kb pre-whitespace stripping.
fs.writeFileSync('./min-pretty.json', JSON.stringify(minimized, null, 2));
fs.writeFileSync('./min.json', JSON.stringify(minimized));

// 4072kb with `code number`
// 4453kb with s, n
// 4938kb with `name (number)`