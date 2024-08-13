import { describe, expect, test } from 'vitest';
import { normalizeCardName } from './CardNames.mjs';

describe('normalizeCardNames()', () => {
    describe('Case Insensitive', () => {
        [
            { input: `Delver of Secrets`, expected: `delver of secrets` },
            { input: `Mr. HoUse, preSiDent and CEO`, expected: `mr. house, president and ceo` },
            { input: `Richard Garfield, Ph.D.`, expected: `richard garfield, ph.d.`},
        ].map((t) => {
            test(t.input, () => {
                expect(normalizeCardName(t.input)).toBe(t.expected);
            });
        });
    });

    describe('Whitespace', () => {
        [
            { input: `  Delver  of \t Secrets   `, expected: `delver of secrets` },
        ].map((t) => {
            test(t.input, () => {
                expect(normalizeCardName(t.input)).toBe(t.expected);
            });
        });
    });

    describe('Split Cards', () => {
        [
            { input: `Fire // Ice`, expected: `fire // ice` },
            { input: `Nezumi Graverobber // Nighteyes the Desecrator`, expected: `nezumi graverobber // nighteyes the desecrator` },
            { input: `Fire / Ice`, expected: `fire // ice` },
            { input: `Fire//ice`, expected: `fire // ice` },
            { input: `fire/Ice`, expected: `fire // ice` },
            { input: `Fire  //  Ice`, expected: `fire // ice` },
            { input: `Who // What //When / Where/ Why`, expected: `who // what // when // where // why` },
        ].map((t) => {
            test(t.input, () => {
                expect(normalizeCardName(t.input)).toBe(t.expected);
            });
        });
    });

    describe('Special Characters', () => {
        [
            { input: `Æther Vial`, expected: `aether vial` },
            { input: `Teferi's Protection`, expected: `teferi's protection` },
            { input: `Teferi’s Protection`, expected: `teferi's protection` },
            { input: `Lim-Dûl‘s Vault`, expected: `lim-dul's vault` },
            { input: `Robo-Piñata`, expected: `robo-pinata` },
            { input: `Now You See Me . . .`, expected: `now you see me...` },
            { input: `Now You See Me...`, expected: `now you see me...` },
            { input: `How Is This a Par Three?!`, expected: `how is this a par three?!` },
            { input: `_____ _____ _____ Trespasser`, expected: `_ _ _ trespasser` },
            { input: `__ Bird Gets the Worm`, expected: `_ bird gets the worm` },
            { input: `"Brims" Barone, Midway Mobster`, expected: `"brims" barone, midway mobster` },
            { input: `Impounding Lot-Bot`, expected: `impounding lot-bot` },
            { input: `T.A.P.P.E.R.`, expected: `t.a.p.p.e.r.` },
            { input: `+2 Mace`, expected: `+2 mace` },
            { input: `Erase (Not the Urza‛s Legacy One)`, expected: `erase (not the urza's legacy one)`},
        ].map((t) => {
            test(t.input, () => {
                expect(normalizeCardName(t.input)).toBe(t.expected);
            });
        });
    });
});
