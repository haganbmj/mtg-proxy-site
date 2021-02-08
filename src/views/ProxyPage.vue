<template>
    <div class="section">
        <div id="help-modal" class="modal active" v-show="showHelp">
            <a href="#" class="modal-overlay" aria-label="Close" @click="showHelp = false"></a>
            <div class="modal-container">
                <div class="modal-header">
                    <a href="#" class="btn btn-clear float-right" aria-label="Close" @click="showHelp = false"></a>
                    <div class="modal-title h4">Help, Tips & Tricks, FAQ</div>
                </div>
                <div class="modal-body">
                    <div class="content">
                        <h5>Basic Usage</h5>
                        <p>Paste a list of cards into the input box and hit <i>Submit</i>. Most deck builder export formats should be supported, but if you find something that doesn't work let me know on either of the Twitter or Github links at the top of the desktop site.</p>
                        <p>Once your list is loaded, you can adjust set selections using the dropdowns below each card.</p>
                        <p>Either click the <i>Print</i> button on the page or use your browser's Print menus to complete the process.</p>

                        <h5>Print Formatting</h5>
                        <p><b>Paper Size:</b> Use your browser's print dialog to configure options such as the paper size and printer destination. Saving as a PDF is listed as a printer selection in all modern browsers.</p>
                        <p><b>Card Scaling:</b> Use your browser's print dialog to also configure the scale. I recommend staying within +/-2% if you're looking to squeeze these into standard sized sleeves.</p>
                        <p><b>Margins:</b> I recommend <b>not</b> adjusting the margins on the page, but wish you the best of luck if you opt to.</p>

                        <h5>Known Issues</h5>
                        <p><b>Set Selections not Saved:</b> The page currently overwrites your set selections if you hit <i>Update</i>. Just use caution.</p>
                        <p><b>Meld Card Backs:</b> The back face of Meld cards are currently unprintable, but who the hell plays Meld anyways?</p>
                        <p><b>Show Promo/Digital:</b> Yeah yeah, I keep finding more stuff that doesn't fit Scryfall's data format, so there might be some promos that are lingering around that aren't properly flagged.</p>
                        <p><b>Tokens/Emblems/Etc:</b> Currently there's no focus on supporting these, so they likely won't appear. The token printing versions are a mess (especially with double faced tokens) that I haven't wanted to wade through yet.</p>
                        <p><b>Non-English:</b> There is no intended support for non-English cards, but there might be a couple that have slipped through. Scryfall's foreign card imagery is very limited for older cards, but eventually maybe I'll get the appetite to tackle it for the newer stuff.</p>

                        <h5>Misc</h5>
                        <p>This site is modeled as a substitute for MTGPress since that site has been unusable for a while. As such it's using the cropped down images, so expect thin borders when using it. I personally prefer this, but some people find find it more tedious to cut out.</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <a href="#" class="btn btn-link" aria-label="Close" @click="showHelp = false">Close</a>
                </div>
            </div>
        </div>

        <div class="columns">
            <div class="column col-3 col-sm-12">
                <div id="config" class="form-group p-sticky">
                    <div class="form-group">
                        <textarea id="deck-input" class="form-input" v-model="config.decklist" rows="20" autofocus
                            placeholder="4 Wild Nacatl&#10;4 Steppe Lynx&#10;0x Griselbrand&#10;4x Lightning Bolt&#10;3x Price of Progress&#10;4 Strip Mine (ATQ) 82d&#10;&#10;// Sideboard&#10;Orim's Chant&#10;3x Rough // Tumble&#10;SB: dead/gone"></textarea>
                    </div>

                    <div class="form-group btn-group btn-group-block">
                        <button id="submit-decklist" class="btn btn-primary" @click="loadCardList()">{{ cards.length ? 'Update' : 'Submit' }}</button>
                        <button id="print" class="btn btn-block" @click="printList" :disabled="cards.length == 0"><span class="icon-print"></span> Print</button>
                    </div>

                    <div class="spacer" style="height:0.4rem;"></div>
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

                        <div class="column col-12 divider"></div>

                        <div class="column col-12">
                            <button class="btn p-centered" @click="showHelp = true">Help?</button>
                        </div>

                        <div class="column col-12 divider"></div>
                    </div>
                </div>
            </div>

            <div class="column col-9 col-sm-12">
                <div class="empty" v-show="cards.length === 0 && errors.length === 0">
                    <div class="empty-icon">
                        <i class="icon icon-3x icon-search"></i>
                    </div>
                    <p class="empty-title h5" style="max-width: 25rem;">"I welcome and seek your ideas, but do not bring me small ideas; bring me big ideas to match our future."</p>
                    <p class="empty-subtitle">- Arnold Schwarzenegger</p>
                </div>

                <div id="input-errors" class="toast toast-error" v-show="errors.length > 0">
                    <button class="btn btn-clear float-right" @click="errors = []"></button>
                    <div>Some cards could not be identified.</div>
                    <ul>
                        <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
                    </ul>
                </div>

                <div class="cards columns">
                    <div v-for="(card, index) in cards" :key="index" class="card-select column col-3 col-sm-6 mt-2" v-show="shouldShowCard(card)">
                        <div class="p-relative">
                            <image-loader class="card-image img-responsive" :src="card.selectedOption.url" placeholder="./card_back.jpg" :alt="card.name" />
                            <span class="card-quantity bg-primary text-light docs-shape s-rounded centered">{{ card.quantity }}x</span>
                            <select class="form-select select-sm mt-2" v-model="card.selectedOption">
                                <option v-for="(set, index) in card.setOptions" :value="set" :key="index" v-show="shouldShowSetOption(card, set)">{{ set.name }}</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div id="arnold" class="columns col-9 col-sm-12 col-mx-auto">
                    <template v-if="arnoldApproves">
                        <span class="h6 p-centered"><i>Your list doesn't contain Griselbrand! Good job.</i></span>
                        <blockquote>
                            <p>Life may be full of pain, but that’s not an excuse to give up.</p>
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
import ImageLoader from '../components/ImageLoader.vue'

const basicLands = [
    'wastes',
    'forest', 'island', 'plains', 'swamp', 'mountain',
    'snow-covered forest', 'snow-covered island',
    'snow-covered plains', 'snow-covered swamp',
    'snow-covered mountain'];

export default {
    name: 'ProxyPage',
    components: {
        'image-loader': ImageLoader,
    },
    data() {
        return {
            showHelp: false,
            config: {
                includeDigital: false,
                includePromo: false,
                includeBasics: false,
                dfcBacks: true,
                decklist: '',
            },
            cards: [],
            errors: [],
        }
    },
    computed: {
        arnoldApproves() {
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
        shouldShowSetOption(card, option) {
            // FIXME: Need a better filter method to detect promo-only garbage.
            if (card.setOptions.length <= 1 || card.selectedOption == option) {
                return true;
            }

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
            this.errors = [];
            for (let line of this.config.decklist.split('\n')) {
                line = line.trim();

                // Different sites have different sideboard formats.
                // Look for the word "sideboard" or lines that start with a double slash and skip them.
                if (/Sideboard/i.test(line) || /^\/\//.test(line) || line === '') {
                    continue;
                }

                // Extract the quantity and card name.
                // Cockatrice prefixes lines with "SB:" for sideboard cards, so optionally matching that.
                // MTGA's export format puts the set and collector number in the line. ex. Arid Mesa (ZEN) 211
                let extract = /^(?:SB:\s)?(?:(\d+)?x?\s)?([^(]+)(?:\s\(.+\) .+)?$/i.exec(line);
                if (extract === null) {
                    this.errors.push(line);
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
                    this.errors.push(line);
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
                            url: `https://c1.scryfall.com/file/scryfall-cards/border_crop/front/${option.f}`,
                            urlBack: option.b ? `https://c1.scryfall.com/file/scryfall-cards/border_crop/back/${option.b}` : undefined,
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

.card-image {
    /* border-radius: 4.75% / 3.5%; */
    border-radius: 0.3rem;
}

#arnold {
    margin-top: 2.4em;
}

#input-errors ul li {
    margin-top: unset;
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
