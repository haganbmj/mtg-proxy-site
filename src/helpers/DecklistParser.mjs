import { normalizeCardName } from './CardNames.mjs';

export function parseDecklist(decklist) {
    const response = {
        lines: [],
        errors: [],
    }
    for (let line of decklist.split('\n')) {
        line = line.trim();

        // Different sites have different sideboard formats.
        // Look for the word "sideboard" or lines that start with a double slash and skip them.
        // MTGA uses Sideboard and Deck as section headers.
        if (/^Sideboard$/i.test(line) || /^Deck$/i.test(line) || /^\/\//.test(line) || line === '') {
            continue;
        }

        // Extract the quantity and card name.
        // Cockatrice prefixes lines with "SB:" for sideboard cards, so optionally matching that.
        // Last I knew MTGA's export format puts the set and collector number in the line. ex. Arid Mesa (ZEN) 211
        let extract = /^(?:SB:\s)?(?:(\d+)?x?\s)?(.+?)(?:\s\([^()]+\)\s+\w+)?$/i.exec(line);
        if (extract === null) {
            response.errors.push(line);
            console.warn(`Failed to parse line: ${line}`);
            continue;
        }

        let [, quantity, inputCardName] = extract;

        if (quantity === undefined) {
            quantity = 1;
        }

        // parseInt should be safe here since it's a digit extraction,
        // decimal numbers will just get roped into the cardName and fail.
        if (parseInt(quantity) <= 0) {
            continue;
        }

        const cardName = normalizeCardName(inputCardName);

        response.lines.push({
            name: cardName,
            quantity: quantity,
        })
    }

    return response;
}
