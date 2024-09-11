<template>
  <div class="section">
    <HelpModal ref="helpModal" />

    <div class="columns">
      <div class="column col-3 col-sm-12 mb-2" style="z-index: 300">
        <div id="config" class="form-group p-sticky">
          <div class="form-group">
            <textarea
              id="deck-input"
              class="form-input"
              title="Deck Input"
              v-model="config.decklist"
              autofocus
              placeholder="4 Wild Nacatl&#10;4 Steppe Lynx&#10;0x Griselbrand&#10;4x Lightning Bolt&#10;3x Price of Progress&#10;4 Strip Mine (ATQ) 82d&#10;&#10;// Sideboard&#10;Orim's Chant&#10;3x Rough // Tumble&#10;SB: dead/gone"
            />
          </div>

          <div class="form-group btn-group btn-group-block">
            <button
              id="submit-decklist"
              class="btn btn-primary"
              @click="loadCardList()"
            >
              {{ cards.length ? $t('buttons.update') : $t('buttons.submit') }}
            </button>
            <button
              id="print"
              class="btn btn-block tooltip"
              @click="printList"
              :disabled="cards.length == 0"
              :data-tooltip="$t('consumedSlots', { count: cardCountWhenPrinting.count, bound: cardCountWhenPrinting.bound})"
            >
              <span class="icon-print" /> {{ $t('buttons.print') }}
            </button>
          </div>

          <div class="form-group btn-group btn-group-block">
            <div id="slot-usage" class="bar">
              <template v-for="index in 9" :key="index">
                <div
                  :class="`bar-item ${index <= cardCountWhenPrinting.overflow ? 'consumed' : 'unconsumed'}`"
                  role="progressbar"
                />
              </template>
            </div>
          </div>

          <div class="spacer" style="height: 0.4rem" />
          <div
            class="divider text-center"
            :data-content="$t('configuration.label').toUpperCase()"
          />

          <div class="columns">
            <div class="column col-12">
              <label class="form-switch">
                <input
                  type="checkbox"
                  name="include-digital"
                  v-model="config.includeDigital"
                >
                <i class="form-icon" /> {{ $t('configuration.showDigitalPrintings') }}
              </label>
            </div>

            <div class="column col-12">
              <label class="form-switch">
                <input
                  type="checkbox"
                  name="include-promo"
                  v-model="config.includePromo"
                >
                <i class="form-icon" /> {{ $t('configuration.showPromoPrintings') }}
              </label>
            </div>

            <div class="column col-12">
              <label class="form-switch">
                <input
                  type="checkbox"
                  name="match-editions"
                  v-model="config.matchEditions"
                >
                <i class="form-icon" /> {{ $t('configuration.matchInputEditions') }}
              </label>
            </div>

            <div class="column col-12">
              <label class="form-switch">
                <input
                  type="checkbox"
                  name="include-basics"
                  v-model="config.includeBasics"
                >
                <i class="form-icon" /> {{ $t('configuration.includeBasicLands') }}
              </label>
            </div>

            <div class="column col-12">
              <label class="form-switch">
                <input
                  type="checkbox"
                  name="show-cut-lines"
                  v-model="config.showCutLines"
                >
                <i class="form-icon" /> {{ $t('configuration.showCutLines') }}
              </label>
            </div>
          </div>
          <div class="column col-12 divider" />
          <div class="columns">
            <div class="column col-12">
              <label class="form-label">
                <span
                  class="tooltip tooltip-right"
                  :data-tooltip="$t('configuration.imageType.tooltip')"
                ><i class="form-icon" /> {{ $t('configuration.imageType.label') }}
                  <span class="icon-info" /></span>
                <select
                  class="form-select select"
                  name="image-type"
                  v-model="config.imageType"
                  style="width: 100%"
                >
                  <option value="normal">{{ $t('configuration.imageType.normal') }}</option>
                  <option value="border_crop">{{ $t('configuration.imageType.borderCrop') }}</option>
                </select>
              </label>
            </div>

            <div class="column col-12">
              <label class="form-label">
                <span
                  class="tooltip tooltip-right"
                  :data-tooltip="$t('configuration.printScale.tooltip')"
                ><i class="form-icon" /> {{ $t('configuration.printScale.label') }}
                  <span class="icon-info" /></span>
                <select
                  class="form-select select"
                  name="scale"
                  v-model="config.scale"
                  style="width: 100%"
                >
                  <option value="small">{{ $t('configuration.printScale.small') }} (-2%)</option>
                  <option value="normal">{{ $t('configuration.printScale.regular') }} (60mm x 85mm)</option>
                  <option value="large">{{ $t('configuration.printScale.large') }} (+2%)</option>
                  <option value="actual">{{ $t('configuration.printScale.actual') }} (63mm x 88mm)</option>
                </select>
              </label>
            </div>

            <div class="column col-12">
              <label class="form-label">
                <i class="form-icon" /> {{ $t('configuration.cardBacks.label') }}
                <select
                  class="form-select select"
                  name="card-backs"
                  v-model="config.cardBacks"
                  style="width: 100%"
                >
                  <option value="none">{{ $t('configuration.cardBacks.none') }}</option>
                  <option value="dfc">{{ $t('configuration.cardBacks.dfcs') }}</option>
                  <option value="all">{{ $t('configuration.cardBacks.all') }}</option>
                </select>
              </label>
            </div>
          </div>
          <div class="column col-12 divider" />
          <div class="columns">
            <div class="column col-12">
              <button
                class="btn p-centered"
                @click="$refs.helpModal.show()"
              >
                {{ $t('configuration.help.label') }}
              </button>
            </div>
          </div>
          <div class="column col-12 divider" />
        </div>
      </div>

      <div class="column col-9 col-sm-12">
        <div
          class="empty"
          v-show="cards.length === 0 && errors.length === 0"
        >
          <div class="empty-icon">
            <i class="icon icon-3x icon-search" />
          </div>
          <p class="empty-title h5" style="max-width: 25rem">
            "I welcome and seek your ideas, but do not bring me
            small ideas; bring me big ideas to match our future."
          </p>
          <p class="empty-subtitle">
            - Arnold Schwarzenegger
          </p>
        </div>

        <div
          id="input-errors"
          class="toast toast-error"
          v-show="errors.length > 0"
        >
          <button
            class="btn btn-clear float-right"
            alt="Dismiss Errors"
            @click="errors = []"
          />
          <div>{{ $t('errors.unableToIdentifyCards') }}</div>
          <ul>
            <li v-for="(error, index) in errors" :key="index">
              {{ error }}
            </li>
          </ul>
        </div>

        <div class="cards columns">
          <div
            v-for="(card, cardIndex) in cards"
            :key="cardIndex"
            class="card-select column col-3 col-sm-6 mt-2"
            v-show="shouldShowCard(card)"
          >
            <div class="p-relative">
              <ImageLoader
                class="card-image img-responsive"
                :src="resolveCardImage(card)"
                placeholder="./card_back_border_crop.jpg"
                :alt="card.name"
              />
              <span
                class="card-quantity bg-primary text-light docs-shape s-rounded centered"
              >{{ card.quantity }}x</span>
              <select
                class="form-select select-sm mt-2"
                name="selected-option"
                v-model="card.selectedOption"
                @change="
                  updateSessionSet(
                    card.name,
                    card.selectedOption,
                  )
                "
              >
                <option
                  v-for="(set, setIndex) in card.setOptions"
                  :value="set"
                  :key="setIndex"
                  v-show="shouldShowSetOption(card, set)"
                >
                  {{ set.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <ArnoldsApproval id="arnold" :cards="cards" />
      </div>
    </div>
  </div>

  <div
    id="print-content"
    :class="[
      `scale-${config.scale}`,
      { 'with-cut-lines': config.showCutLines },
    ]"
  >
    <template v-for="(card, index) in cards" :key="index">
      <template v-for="n in card.quantity" :key="n">
        <img
          :src="resolveCardImage(card)"
          v-show="shouldShowCard(card)"
        >
        <img
          :src="resolveCardImage(card, 'back')"
          v-show="shouldShowCard(card, 'back')"
        >
      </template>
    </template>
  </div>
</template>

<script>
import { parseDecklist } from "../helpers/DecklistParser.mjs";
import { bindStorage } from "../helpers/VueLocalStorage.mjs";
import ImageLoader from "../components/ImageLoader.vue";
import HelpModal from "../components/HelpModal.vue";
import ArnoldsApproval from "../components/ArnoldsApproval.vue";

// Chunk out the card list for quasi-lazy loading. Or at least loading that doesn't block the page rendering.
const ScryfallDatasetAsync = () => import("../../data/cards-minimized.json");

const basicLands = [
    "wastes",
    "forest",
    "island",
    "plains",
    "swamp",
    "mountain",
    "snow-covered wastes",
    "snow-covered forest",
    "snow-covered island",
    "snow-covered plains",
    "snow-covered swamp",
    "snow-covered mountain",
];

function setImageVersion(url, version) {
    if (/scryfall/.test(url)) {
        var url = new URL(url);
        url.searchParams.set("version", version);
        return url.href;
    } else {
        return url;
    }
}

export default {
    name: "ProxyPage",
    components: {
        ImageLoader,
        HelpModal,
        ArnoldsApproval,
    },
    data() {
        return {
            config: {
                includeDigital: false,
                includePromo: false,
                matchEditions: false,
                includeBasics: false,
                showCutLines: false,
                imageType: "border_crop",
                scale: "normal",
                cardBacks: "dfc",
                decklist: "",
            },
            sets: {},
            cards: [],
            errors: [],
            sessionSetSelections: {},
        };
    },
    computed: {
        cardCountWhenPrinting() {
            const count = this.cards.reduce((total, c) => {
                return (
                    total +
                    c.quantity *
                        ((this.shouldShowCard(c, "front") ? 1 : 0) +
                            (this.shouldShowCard(c, "back") ? 1 : 0))
                );
            }, 0);

            const overflow = count % 9;
            const bound = overflow == 0 ? count : count + (9 - (count % 9));

            return {
                count,
                overflow,
                bound,
                percentage: Math.round((overflow / 9) * 100),
            };
        },
    },
    mounted() {
        // Trigger an immediate load of the card list + set names.
        this.loadSetList();
        this.initConfig();
    },
    methods: {
        async loadSetList() {
            const dataset = (await ScryfallDatasetAsync());
            this.sets = dataset.sets;
            console.log(`Loaded ${Object.keys(dataset.cards).length} distinct cards from ${Object.keys(dataset.sets).length} sets.`)
        },
        initConfig() {
            this.config.includeDigital = bindStorage('includeDigital', (v) => v === "true");
            this.config.includePromo = bindStorage('includePromo', (v) => v === "true");
            this.config.matchEditions = bindStorage('matchEditions', (v) => v === "true");
            this.config.includeBasics = bindStorage('includeBasics', (v) => v === "true");
            this.config.showCutLines = bindStorage('showCutLines', (v) => v === "true");
            this.config.imageType = bindStorage('imageType', (v) => v ?? "border_crop");
            this.config.scale = bindStorage('scale', (v) => v ?? "normal");
            this.config.cardBacks = bindStorage('cardBacks', (v) => v ?? "dfc");
        },
        shouldShowSetOption(card, option) {
            // FIXME: Need a better filter method to detect promo-only garbage.
            // This initial clause here is to tackle promo-only or if the user has a promo selected.
            if (card.setOptions.length <= 1 || card.selectedOption == option) {
                return true;
            }

            return (
                (this.config.includeDigital || !option.isDigital) &&
                (this.config.includePromo || !option.isPromo)
            );
        },
        shouldShowCard(card, face = "front") {
            if (!this.config.includeBasics && card.isBasic) {
                return false;
            }

            if (face === "back") {
                if (this.config.cardBacks === "all") {
                    return true;
                }

                if (
                    this.config.cardBacks === "none" ||
                    card.selectedOption.urlBack === undefined
                ) {
                    return false;
                }
            }

            return true;
        },
        resolveCardImage(card, face = "front") {
            if (face == "front") {
                return setImageVersion(
                    card.selectedOption.urlFront,
                    this.config.imageType,
                );
            } else {
                if (card.selectedOption.urlBack !== undefined) {
                    return setImageVersion(
                        card.selectedOption.urlBack,
                        this.config.imageType,
                    );
                } else {
                    return `./card_back_${this.config.imageType}.jpg`;
                }
            }
        },
        updateSessionSet(cardName, setOption) {
            this.sessionSetSelections[cardName] = setOption;
        },
        printList() {
            window.print();
        },
        async loadCardList() {
            this.cards = [];
            this.errors = [];

            const { lines, errors } = parseDecklist(this.config.decklist);
            this.errors = errors;

            const _cards = [];

            for (let line of lines) {
                let cardLookup = (await ScryfallDatasetAsync()).cards[line.name];

                if (!cardLookup) {
                    this.errors.push(line.name);
                    console.warn(
                        `Failed to identify card on line: ${JSON.stringify(line)}`,
                    );
                    continue;
                }

                const options = {
                    quantity: line.quantity,
                    name: line.name,
                    setOptions: cardLookup.map((option) => {
                        // This could use spread syntax, but it's nice to have all the property names in this file explicitly.
                        return {
                            name: `${this.sets[option.setCode]} (${option.collectorNumber})`,
                            setCode: option.setCode,
                            collectorNumber: option.collectorNumber,
                            urlFront: option.urlFront,
                            urlBack: option.urlBack,
                            isDigital: option.isDigital,
                            isPromo: option.isPromo,
                        };
                    }),
                    isBasic: basicLands.includes(line.name.toLowerCase()),
                    selectedOption: this.sessionSetSelections[line.name],
                };

                if (!options.selectedOption) {
                    // Set a default selection.
                    // First, if enabled, attempt to find an exact match from the decklist.
                    if (this.config.matchEditions) {
                        options.selectedOption = options.setOptions.filter(option => {
                            return option.setCode === line.set && option.collectorNumber == line.collectorsNumber
                        })?.[0] ?? undefined;
                    }

                    // If we failed there, then we can set a default based on characteristics.
                    if (!options.selectedOption) {
                        options.selectedOption = options.setOptions.filter(option => {
                            return !option.isDigital && !option.isPromo;
                        })?.[0] ?? options.setOptions[0];
                    }
                }

                _cards.push(options);
            }

            this.cards = _cards;
        },
    },
};
</script>

<style lang="scss">
#deck-input {
    height: 14rem;
}

@media (max-width: 600px) {
    #deck-input {
        height: 10rem;
    }
}

#config {
    top: 0.6rem;
}

#slot-usage {
    border-collapse: collapse;
    height: 0.3rem;

    .bar-item {
        border: 1px solid #bcc3ce;
        border-collapse: collapse;
        width: 11.1%;

        &.consumed {
            background: #5755d9;
        }

        &.unconsumed {
            background: #eef0f3;
        }
    }
}

html.dark-theme {
    #slot-usage .bar-item {
        border: 1px solid #707274;

        &.unconsumed {
            background: #303742;
        }
    }
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
    body {
        all: initial;
    }

    html,
    html * {
        all: unset;
        font-size: 0 !important;
        line-height: 0 !important;
    }

    .section,
    header {
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
        margin-top: 10mm;
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

    #print-content.with-cut-lines img {
        margin: 0 1px 1px 0;
    }

    #print-content.scale-large img {
        width: calc(60mm * 1.02);
        height: calc(85mm * 1.02);
    }

    #print-content.scale-small img {
        width: calc(60mm * 0.98);
        height: calc(85mm * 0.98);
    }

    #print-content.scale-actual img {
        width: 63mm;
        height: 88mm;
    }

    img {
        break-inside: avoid;
    }
}
</style>
