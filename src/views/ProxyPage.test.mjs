import { mount } from '@vue/test-utils';
import ProxyPage from './ProxyPage.vue';
import { describe, expect, test, beforeAll } from 'vitest';

const wrapper = mount(ProxyPage, {
    mocks: {
        $t: () => {},
    },
});

beforeAll(async () => {
    // Wait for the Async mounted functions to run and initialize the card dataset.
    while(Object.keys(wrapper.getCurrentComponent().data.sets).length === 0) {
        await new Promise(r => setTimeout(r, 50));
    }
}, 10000);

describe('Core Rendering', async () => {
    test('Renders', () => {
        expect(wrapper.find('#deck-input').exists()).toBe(true);
    });
});

describe('Deck Loading', async () => {
    await wrapper.find('#deck-input').setValue('4 Wild Nacatl');
    await wrapper.find('#submit-decklist').trigger('click');

    test('Properties', () => {
        const cards = wrapper.getCurrentComponent().data.cards;
        // console.log(JSON.stringify(cards[0]));
        expect(cards.length).toBe(1);
        expect(cards[0].quantity).toBe(4);
        expect(cards[0].name).toBe('wild nacatl');
    });

    test('Has Card Entry', () => {
        expect(wrapper.findAll('.card-select').length).toBe(1);
    })
});

describe('shouldShowSetOption()', async () => {
    const options = {
        standard: { name: 'Standard (001)', isPromo: undefined, isDigital: undefined },
        promo: { name: 'Promo (001)', isPromo: true, isDigital: undefined },
        digital: { name: 'Digital (001)', isPromo: undefined, isDigital: true },
        digitalPromo: { name: 'Promo and Digital (001)', isPromo: true, isDigital: true },
    }
    const card = {
        quantity: 1,
        name: 'test',
        isBasic: undefined,
        setOptions: [
            options.standard,
            options.promo,
            options.digital,
            options.digitalPromo,
        ],
        selectedOption: options.standard,
    };

    test('No Promos, No Digital', () => {
        wrapper.find('input[name="include-digital"]').setValue(false);
        wrapper.find('input[name="include-promo"]').setValue(false);
        expect(wrapper.getCurrentComponent().ctx.shouldShowSetOption(card, options.standard)).toBe(true);
        expect(wrapper.getCurrentComponent().ctx.shouldShowSetOption(card, options.digital)).toBe(false);
        expect(wrapper.getCurrentComponent().ctx.shouldShowSetOption(card, options.promo)).toBe(false);
        expect(wrapper.getCurrentComponent().ctx.shouldShowSetOption(card, options.digitalPromo)).toBe(false);
    });

    test('No Promos, Yes Digital', () => {
        wrapper.find('input[name="include-digital"]').setValue(true);
        wrapper.find('input[name="include-promo"]').setValue(false);
        expect(wrapper.getCurrentComponent().ctx.shouldShowSetOption(card, options.standard)).toBe(true);
        expect(wrapper.getCurrentComponent().ctx.shouldShowSetOption(card, options.digital)).toBe(true);
        expect(wrapper.getCurrentComponent().ctx.shouldShowSetOption(card, options.promo)).toBe(false);
        expect(wrapper.getCurrentComponent().ctx.shouldShowSetOption(card, options.digitalPromo)).toBe(false);
    });

    test('Yes Promos, No Digital', () => {
        wrapper.find('input[name="include-digital"]').setValue(false);
        wrapper.find('input[name="include-promo"]').setValue(true);
        expect(wrapper.getCurrentComponent().ctx.shouldShowSetOption(card, options.standard)).toBe(true);
        expect(wrapper.getCurrentComponent().ctx.shouldShowSetOption(card, options.digital)).toBe(false);
        expect(wrapper.getCurrentComponent().ctx.shouldShowSetOption(card, options.promo)).toBe(true);
        expect(wrapper.getCurrentComponent().ctx.shouldShowSetOption(card, options.digitalPromo)).toBe(false);
    });

    test('Yes Promos, Yes Digital', () => {
        wrapper.find('input[name="include-digital"]').setValue(true);
        wrapper.find('input[name="include-promo"]').setValue(true);
        expect(wrapper.getCurrentComponent().ctx.shouldShowSetOption(card, options.standard)).toBe(true);
        expect(wrapper.getCurrentComponent().ctx.shouldShowSetOption(card, options.digital)).toBe(true);
        expect(wrapper.getCurrentComponent().ctx.shouldShowSetOption(card, options.promo)).toBe(true);
        expect(wrapper.getCurrentComponent().ctx.shouldShowSetOption(card, options.digitalPromo)).toBe(true);
    });
});

describe('Print layout', async () => {
    test('All pages mode mirrors back rows', () => {
        const data = wrapper.getCurrentComponent().data;
        const ctx = wrapper.getCurrentComponent().ctx;

        data.config.cardBacks = 'all-pages';
        data.cards = [
            {
                quantity: 1,
                name: 'alpha',
                isBasic: false,
                selectedOption: { urlFront: 'a-front', urlBack: 'a-back' },
            },
            {
                quantity: 1,
                name: 'bravo',
                isBasic: false,
                selectedOption: { urlFront: 'b-front', urlBack: 'b-back' },
            },
            {
                quantity: 1,
                name: 'charlie',
                isBasic: false,
                selectedOption: { urlFront: 'c-front', urlBack: 'c-back' },
            },
        ];

        const pages = ctx.printPages;
        expect(pages.length).toBe(2);

        const frontSlots = pages[0].slots.slice(0, 3).map((slot) => slot.card.name);
        const backSlots = pages[1].slots.slice(0, 3).map((slot) => slot.card.name);

        expect(frontSlots).toEqual(['alpha', 'bravo', 'charlie']);
        expect(backSlots).toEqual(['charlie', 'bravo', 'alpha']);
    });

    test('All pages mode doubles page count and pads', () => {
        const data = wrapper.getCurrentComponent().data;
        const ctx = wrapper.getCurrentComponent().ctx;

        data.config.cardBacks = 'all-pages';
        data.cards = Array.from({ length: 10 }, (_, i) => {
            return {
                quantity: 1,
                name: `card-${i + 1}`,
                isBasic: false,
                selectedOption: { urlFront: `front-${i + 1}`, urlBack: `back-${i + 1}` },
            };
        });

        const pages = ctx.printPages;
        expect(pages.length).toBe(4);
        expect(pages[0].slots.length).toBe(9);
        expect(pages[1].slots.length).toBe(9);
        expect(pages[2].slots.length).toBe(9);
        expect(pages[3].slots.length).toBe(9);
        expect(pages[1].slots.filter(Boolean).length).toBe(1);
        expect(pages[3].slots.filter(Boolean).length).toBe(1);
    });
});
