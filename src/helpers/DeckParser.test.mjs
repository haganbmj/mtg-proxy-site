import { describe, expect, test } from 'vitest';
import { parseDecklist } from './DecklistParser.mjs';

describe('parseDecklist()', () => {
    describe('Quantities', () => {
        test('Unspecified', () => {
            expect(
                parseDecklist(
                    `
                    Ghor-Clan Rampager
                    `
                )
            ).toStrictEqual(
                {
                    lines: [
                        { name: 'ghor-clan rampager', quantity: 1 },
                    ],
                    errors: [],
                }
            );
        });

        test('N abc', () => {
            expect(
                parseDecklist(
                    `
                    3 Ghor-Clan Rampager
                    `
                )
            ).toStrictEqual(
                {
                    lines: [
                        { name: 'ghor-clan rampager', quantity: 3 },
                    ],
                    errors: [],
                }
            );
        });

        test('Nx abc', () => {
            expect(
                parseDecklist(
                    `
                    4x Ghor-Clan Rampager
                    `
                )
            ).toStrictEqual(
                {
                    lines: [
                        { name: 'ghor-clan rampager', quantity: 4 },
                    ],
                    errors: [],
                }
            );
        });

        test('Double Digit', () => {
            expect(
                parseDecklist(
                    `
                    43 Ghor-Clan Rampager
                    `
                )
            ).toStrictEqual(
                {
                    lines: [
                        { name: 'ghor-clan rampager', quantity: 43 },
                    ],
                    errors: [],
                }
            );
        });

        test('Zero', () => {
            expect(
                parseDecklist(
                    `
                    0 Ghor-Clan Rampager
                    `
                )
            ).toStrictEqual(
                {
                    lines: [],
                    errors: [],
                }
            );
        });

        test('Mixed', () => {
            expect(
                parseDecklist(
                    `
                    4 Kird Ape
                    39x Fireblast
                    1 +2 Mace
                    Ghor-Clan Rampager
                    0 Griselbrand
                    9 9 9 9 9
                    `
                )
            ).toStrictEqual(
                {
                    lines: [
                        { name: 'kird ape', quantity: 4 },
                        { name: 'fireblast', quantity: 39 },
                        { name: '+2 mace', quantity: 1 },
                        { name: 'ghor-clan rampager', quantity: 1 },
                        { name: '9 9 9 9', quantity: 9 },
                    ],
                    errors: [],
                }
            );
        });
    });

    describe('Ignored Lines', () => {
        test('Empty Lines', () => {
            expect(
                parseDecklist(
                    `

                    `
                )
            ).toStrictEqual(
                {
                    lines: [],
                    errors: [],
                }
            )
        });

        test('Deck Section Header', () => {
            expect(
                parseDecklist(
                    `
                    Deck
                    1x Abandon Hope
                    `
                )
            ).toStrictEqual(
                {
                    lines: [
                        { name: 'abandon hope', quantity: 1 },
                    ],
                    errors: [],
                }
            )
        });

        test('Sideboard Section Header', () => {
            expect(
                parseDecklist(
                    `
                    sideboard
                    Sideboard
                    3x Abandon Hope
                    SB:   2x Price of Progress
                    `
                )
            ).toStrictEqual(
                {
                    lines: [
                        { name: 'abandon hope', quantity: 3 },
                        { name: 'price of progress', quantity: 2 },
                    ],
                    errors: [],
                }
            )
        });

        test('Commented Out Lines', () => {
            expect(
                parseDecklist(
                    `
                    // Comment
                    2x Abandon Hope
                    // Another comment
                    fire // ice
                    `
                )
            ).toStrictEqual(
                {
                    lines: [
                        { name: 'abandon hope', quantity: 2 },
                        { name: 'fire // ice', quantity: 1 },
                    ],
                    errors: [],
                }
            )
        });
    });

    describe('Deck Formats', () => {
        test('MTGA Format', () => {
            expect(
                parseDecklist(
                    `
                    Deck
                    4 Abandon Hope (TMP) 107
                    2 Hazmat Suit (USED)
                    Erase (Not the Urza‛s Legacy One) (UNH) 10
                    2x Vadmir, New Blood (POTJ) 113p
                    `
                )
            ).toStrictEqual(
                {
                    lines: [
                        { name: 'abandon hope', quantity: 4 },
                        { name: 'hazmat suit (used)', quantity: 2 },
                        { name: `erase (not the urza's legacy one)`, quantity: 1 },
                        { name: 'vadmir, new blood', quantity: 2 },
                    ],
                    errors: [],
                }
            )
        });

        test('Basic Format', () => {
            expect(
                parseDecklist(
                    `
                    4 Abandon Hope
                    2 Hazmat Suit (USED)
                    1 Erase (Not the Urza‛s Legacy One)

                    Sideboard
                    2 Vadmir, New Blood
                    `
                )
            ).toStrictEqual(
                {
                    lines: [
                        { name: 'abandon hope', quantity: 4 },
                        { name: 'hazmat suit (used)', quantity: 2 },
                        { name: `erase (not the urza's legacy one)`, quantity: 1 },
                        { name: 'vadmir, new blood', quantity: 2 },
                    ],
                    errors: [],
                }
            )
        });
    });
});
