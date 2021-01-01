export function normalizeCardName(cardName) {
    return cardName
        // Convert diacritics down.
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, "")

        // Use all double slashes for split cards. ex. Fire / Ice => Fire // Ice
        // As of right now split cards are the only ones using slashes, so hopefully this is safe?
        .replace(/([^/])\/([^/])/g,"$1//$2")

        // Normalize case.
        .toLowerCase();
}