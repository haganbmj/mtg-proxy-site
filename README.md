# https://proxy.griselbrand.com

## Hurr Durr, Draw Seven Cards

### Known Issues

- Meld cards don't have backs.
- Search is fairly specific due to exact matching.
- Excluding basic lands and creating a list with _only_ basics is permit, but I'm pretty sure that's a stupid edge case I don't want to deal with.
- Better mutation handling for the textarea. ie. Keep existing selections when adding additional cards.
- Need to verify @media print behavior across multiple browsers.
- Probably also need to document print to pdf process and options.
- Manually adjusting print margins restores the hidden default print page header/footer. Unclear if there's a way to actually remove those or not.
- Not a huge fan of packaging a full card list, but it seemed better than throttling for on api rate limits on Scryfall while still relying on Github pages. Can probably look at making it less of an upfront load though.
- Need to adjust card list construction with regards to the Scryfall image cdn uri, don't want to have to babysit it if Scryfall opts to change their pathing. The easy way to do this would be just not removing the hostname and base path while saving, but that bumps the file size.
- Doesn't acknowledge MTGA format set declarations, though not sure I would want it to.
- Cards with Parenthese in the name don't work, fortunately that's just Un-cards so far.

### Future Thoughts

- Relying on Scryfall's fuzzy match search would provide a means of doing card name lookup with minimal effort, but would add the only (non-image) network call to this thing.

### Decent Test Data Set

```none
0 griselbrand
1 Bolas's Citadel
1 Karn, the Great Creator
1 Teferi's Protection
1 Gaea's Cradle
1 Stormblood Berserker
1 Delver of Secrets
1 Nezumi Graverobber // Nighteyes the Desecrator
1 Fire // Ice
1 dead / GONE
1 who / What // WHEN / wheRE // why
1 Forest
1 Impatient Iguana
1 Pestilence
1 Planewide Disaster
1 Goldmeadow
1 Ashnod's Coupon
1 Axe of the Warmonger
1 Bog Humbugs
1 Lim-Dûl's Vault
2 Lim-Dul's Vault
1 Apes of Rath
1 Berserk (LEB) 186
4 Strip Mine (ATQ) 82d
1 Mana Crypt

// 15 Sideboard
SB: 1 Yixlid Jailer
1 Erase (Not the Urza's Legacy One)
2 Erase
```
