import { mount } from '@vue/test-utils';
import ProxyPage from './ProxyPage.vue';
import { describe, expect, test } from 'vitest';

const wrapper = mount(ProxyPage, {
    mocks: {
        $t: () => {}
    }
});

describe('Mounted', () => {
    describe('Layout', () => {
        test('Renders', async () => {
            expect(wrapper.find('#deck-input').exists()).toBe(true);
        });
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
        wrapper.find('input[name="include-digital"]').setValue = false;
        wrapper.find('input[name="include-promo"]').setValue = false;
        expect(wrapper.getCurrentComponent().ctx.shouldShowSetOption(card, options.standard)).toBe(true);
        expect(wrapper.getCurrentComponent().ctx.shouldShowSetOption(card, options.digital)).toBe(false);
        expect(wrapper.getCurrentComponent().ctx.shouldShowSetOption(card, options.promo)).toBe(false);
        expect(wrapper.getCurrentComponent().ctx.shouldShowSetOption(card, options.digitalPromo)).toBe(false);
    });
});
