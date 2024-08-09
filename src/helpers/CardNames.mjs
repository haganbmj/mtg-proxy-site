export function normalizeCardName(cardName) {
    return cardName
        // Convert diacritics down.
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')

        // Use all double slashes for split cards. ex. Fire / Ice => Fire // Ice
        // As of right now split cards are the only ones using slashes, so hopefully this is safe?
        .replace(/([^/])\/([^/])/g, '$1//$2')

        // Normalize a space before and after the double slashes in split cards.
        .replace(/([^/])\s*\/\/\s*([^/])/g, '$1 // $2')

        // Fix those dumb apostrophes and quotation marks.
        .replace(/[’‚‘‛]/g, `'`)
        .replace(/[‟”„“]/g, `"`)

        // Consolidate underscores.
        .replace(/_+/g, `_`)

        // Remove periods to handle the UNF ". . ." cards?
        .replaceAll('.', '')

        // Strip excess whitespace.
        .replace(/\s+/, ' ')

        // Normalize case.
        .toLowerCase()
        .trim();
}
