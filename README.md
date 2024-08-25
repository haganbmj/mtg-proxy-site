# https://proxy.griselbrand.com

## Hurr Durr, Draw Seven Cards

### Developer Notes

- This project is deployed statically and uses a list of cards bundled with the distributables.
- Use `npm run cards` to build the card list using locally stored data, or `npm run cards:update` to force fetching an updated list from Scryfall.
- Develop locally with `npm run dev`, `npm run test`, and `npm run lint`.
- The UI components are built with [Spectre.css](https://picturepan2.github.io/spectre/index.html), see the linked docs for usage information.

### Decent Test Data Set

This should generate no errors with the current match strategy.

```none
Deck
0 griselbrand
3 Bruna, the Fading Light
1x Karn, the Great Creator (SLD) 501
1 Teferi's Protection
1 Delver of Secrets // Insectile Aberration
1x Nezumi Graverobber // Nighteyes the Desecrator
1 Fire // Ice
1 dead / GONE
1 who /What // WHEN /wheRE // why
1x Forest (PMPS06) 5
1 Impatient Iguana
1 Planewide Disaster
1 Goldmeadow
1 Ashnod's Coupon
1 Axe of the Warmonger
1 Bog   Humbugs
1 Lim-Dûl's Vault
2 Lim-Dul's Vault
4 Strip Mine (ATQ) 82d
1 Mana Crypt
2 Ancestral Hot Dog Minotaur
1 _____ Bird Gets the Worm
2 __ Bird Gets the Worm
Now You See Me . . .
Now You See Me...
5 Robo-Piñata
2 Robo-Pinata 
How Is This a Par Three?!
_____ _____ _____ Trespasser
"Brims" Barone, Midway Mobster
2 ‟Brims” Barone, Midway Mobster (UNF) 507
Start / Finish
Start/Fire () 123
3 bind
2 bind // liberate

Sideboard:
// 15 Sideboard
SB: 1 Yixlid Jailer
1 Erase (Not the Urza's Legacy One)
1 Erase (Not the Urza's Legacy One) (UNH) 10
2 Erase
+2 Mace
1 Krark's Thumb
```
