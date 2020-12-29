# mtg-proxy-site

## Notes

### Known Issues

- Meld cards don't have backs.
- Search is fairly specific due to exact matching.
- Kamigawa Flip cards require both halves of the name.
- No placeholder image/container for card image loading.
- No visual indication of card load on set change.
- Excluding basic lands and creating a list with _only_ basics is permit, but I'm pretty sure that's a stupid edge case I don't want to deal with.
- Better mutation handling for the textarea. ie. Keep existing selections when adding additional cards.
- Need to verify @media print behavior across multiple browsers.
- Probably also need to document print to pdf process and options.
- Manually adjusting print margins restores the hidden default print page header/footer. Unclear if there's a way to actually remove those or not.
- Not a huge fan of packaging a full card list, but it seemed better than throttling for on api rate limits on Scryfall while still relying on Github pages.
- Need to adjust card list construction with regards to the Scryfall image cdn uri, don't want to have to babysit it if Scryfall opts to change their pathing. The easy way to do this would be just not removing the hostname and base path while saving, but that bumps the file size.
- Need some kind of error handling for the textarea.

### Future Thoughts

- Relying on Scryfall's fuzzy match search would provide a means of doing card name lookup with minimal effort, but would add the only (non-image) network call to this thing.
