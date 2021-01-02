<template>
    <div class="section">
        <div class="columns">
            <div class="column col-3 col-sm-12">
                <div id="config" class="form-group p-sticky">
                    <textarea id="deck-input" class="form-input" v-model="config.decklist" rows="20" autofocus
                        placeholder="4 Wild Nacatl&#10;4 Steppe Lynx&#10;0x Griselbrand&#10;4x Lightning Bolt&#10;3x Price of Progress&#10;&#10;// Sideboard&#10;Orim's Chant&#10;3x Rough // Tumble"></textarea>

                    <div class="btn-group btn-group-block">
                        <button id="submit-decklist" class="btn btn-primary" @click="loadCardList()">{{ cards.length ? 'Update' : 'Submit' }}</button>
                        <button id="print" class="btn btn-block" @click="printList" :disabled="cards.length == 0">🖶 Print</button>
                    </div>

                    <div class="spacer" style="height:1.6rem;"></div>
                    <div class="divider text-center" data-content="CONFIGURATION"></div>

                    <div class="columns">
                        <div class="column col-12">
                            <label class="form-switch">
                                <input type="checkbox" v-model="config.includeDigital">
                                <i class="form-icon"></i> Show Digital Printings
                            </label>
                        </div>

                        <div class="column col-12">
                            <label class="form-switch">
                                <input type="checkbox" v-model="config.includePromo">
                                <i class="form-icon"></i> Show Promo Printings
                            </label>
                        </div>

                        <div class="column col-12">
                            <label class="form-switch">
                                <input type="checkbox" v-model="config.includeBasics">
                                <i class="form-icon"></i> Include Basic Lands
                            </label>
                        </div>

                        <div class="column col-12">
                            <label class="form-switch">
                                <input type="checkbox" v-model="config.dfcBacks">
                                <i class="form-icon"></i> Print DFC Backs
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div class="column col-9 col-sm-12">
                <div class="empty" v-show="cards.length === 0">
                    <div class="empty-icon">
                        <i class="icon icon-3x icon-search"></i>
                    </div>
                    <p class="empty-title h5" style="max-width: 25rem;">"I welcome and seek your ideas, but do not bring me small ideas; bring me big ideas to match our future."</p>
                    <p class="empty-subtitle">- Arnold Schwarzenegger</p>
                </div>

                <div class="cards columns">
                    <div v-for="(card, index) in cards" :key="index" class="card-select column col-3 col-sm-6 mt-2" v-show="shouldShowCard(card)">
                        <div class="p-relative">
                            <img class="card-image img-responsive" :src="card.selectedOption.url" :alt="card.name">
                            <span class="card-quantity bg-primary text-light docs-shape s-rounded centered">{{ card.quantity }}x</span>
                            <select class="form-select select-sm mt-2" v-model="card.selectedOption">
                                <option v-for="(set, index) in card.setOptions" :value="set" :key="index" v-show="shouldShowSetOption(set)">{{ set.name }}</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div id="arnold" class="columns col-9 col-sm-12 col-mx-auto">
                    <template v-if="arnoldApproves">
                        <span class="h6 p-centered"><i>Your list doesn't contain Griselbrand! Good job.</i></span>
                        <blockquote>
                            <p>Life may be full of pain but that’s not an excuse to give up.</p>
                            <cite>- Arnold Schwarzenegger</cite>
                        </blockquote>
                    </template>
                    <template v-else-if="arnoldApproves === false">
                        <i class="h6 p-centered">Your list contains Griselbrand. How disappointing.</i>
                        <blockquote>
                            <p>"What is the point of being on this Earth if you are going to be like everyone else?"</p>
                            <cite>- Arnold Schwarzenegger (on Griselbrand)</cite>
                        </blockquote>
                    </template>
                </div>
            </div>
        </div>
    </div>

    <div id="print-content">
        <template v-for="(card, index) in cards" :key="index">
            <img v-for="n in card.quantity" :key="n" :src="card.selectedOption.url" v-show="shouldShowCard(card)">
            <img v-for="n in card.quantity" :key="n" :src="card.selectedOption.urlBack" v-show="shouldShowCard(card, 'back')">
        </template>
    </div>
</template>

<script>
import ScryfallDataset from '../../data/cards-minimized.json'
import { normalizeCardName } from '../helpers/CardNames.mjs'

const basicLands = [
    'wastes',
    'forest', 'island', 'plains', 'swamp', 'mountain',
    'snow-covered forest', 'snow-covered island',
    'snow-covered plains', 'snow-covered swamp',
    'snow-covered mountain'];

export default {
    name: 'ProxyPage',
    components: {
    },
    data() {
        return {
            config: {
                includeDigital: false,
                includePromo: false,
                includeBasics: false,
                dfcBacks: true,
                decklist: '',
            },
            cards: []
        }
    },
    computed: {
        arnoldApproves() {
            console.log('checking for griselbrand');
            if (this.cards.length === 0) {
                return undefined;
            }

            const griselbrand = this.cards.find(card => {
                return card.name === 'griselbrand';
            });

            return griselbrand ? false : true;
        },
    },
    methods: {
        shouldShowSetOption(option) {
            return (this.config.includeDigital || !option.isDigital) && (this.config.includePromo || !option.isPromo);
        },
        shouldShowCard(card, face = 'front') {
            if (!this.config.includeBasics && card.isBasic) {
                return false;
            }

            if (face === 'back' && (card.selectedOption.urlBack === undefined || !this.config.dfcBacks)) {
                return false;
            }

            return true;
        },
        printList() {
            window.print();
        },
        loadCardList() {
            this.cards = [];
            for (let line of this.config.decklist.split('\n')) {
                line = line.trim();

                // Different sites have different sideboard formats.
                if (/^\/\/ Sideboard/i.test(line) || line === '') {
                    continue;
                }

                // Extract the quantity and card name.
                let extract = /^(?:(\d+)?x?\s)?(.+)$/.exec(line);
                if (extract === null) {
                    console.warn(`Failed to parse line: ${line}`);
                    continue;
                }

                let [, quantity, inputCardName] = extract;

                if (quantity === undefined) {
                    quantity = 1;
                }

                // parseInt should be safe here since it's a digit extraction,
                // decimal numbers will just get roped into the cardName and fail.
                if (parseInt(quantity) <= 0) {
                    continue;
                }

                const cardName = normalizeCardName(inputCardName);

                const cardLookup = ScryfallDataset[cardName];

                if (!cardLookup) {
                    console.warn(`Failed to identify card on line: ${line}`);
                    continue;
                }

                const options = {
                    quantity: parseInt(quantity),
                    name: cardName,
                    inputName: inputCardName,
                    setOptions: cardLookup.map(option => {
                        return {
                            name: option.s,
                            url: `https://c1.scryfall.com/file/scryfall-cards/normal/front/${option.f}`,
                            urlBack: option.b ? `https://c1.scryfall.com/file/scryfall-cards/normal/back/${option.b}` : undefined,
                            isDigital: option.d === 'y',
                            isPromo: option.p === 'y',
                        };
                    }),
                    isBasic: basicLands.includes(cardName.toLowerCase()),
                    selectedUrl: '',
                };

                // Set a default selection.
                options.selectedOption = options.setOptions.filter(option => {
                    return !option.isDigital && !option.isPromo;
                })?.[0] ?? options.setOptions[0];

                this.cards.push(options);
            }
        },
    },
}
</script>

<style>
#config {
    top: 0.6rem;
}

.card-quantity {
    font-size: 1.2rem;
    font-weight: 100;
    display: inline-block;
    position: absolute;
    bottom: 2.4rem;
    left: 0.6rem;
    padding: 0.2rem;
    line-height: 1rem;
}

img.card-image {
    border-radius: 4.75% / 3.5%;
}

#arnold {
    margin-top: 2.4em;
}

#print-content {
    display: none;
}

#print-content {
    line-height: 0;
}

#print-content img {
    width: 60mm;
    height: 85mm;
    margin: 0;
    padding: 0;
}

@media print {
    body { all: initial; }
    body * { all: unset; }

    .section, header {
        display: none !important;
    }

    body {
        margin: 0 !important;
    }

    @page {
        size: auto;
        margin-left: 1cm;
        margin-right: 1cm;
        margin-bottom: 5mm;
        margin-top: 5mm;
    }

    html {
        visibility: hidden;
    }

    #print-content {
        visibility: visible;
        display: block !important;
        line-height: 0;
    }

    #print-content img {
        width: 60mm;
        height: 85mm;
        margin: 0;
        padding: 0;
    }

    img {
        break-inside: avoid;
    }
}
</style>
