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

        // Actually, fuck it. Just use the first part of the split card name.
        .replace(/\s\/\/.+/g, '')

        // Fix those dumb apostrophes.
        .replace(/’/g, `'`)

        // Normalize case.
        .toLowerCase();
}
