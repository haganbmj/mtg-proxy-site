# MTG Proxy Site Guidelines

## Tech Stack & Build

**Framework:** Vue 3 + Vite + Vitest + ESLint 9 + Spectre.css + Vue I18n

**Key Commands:**
- `npm run dev` - Start development server  
- `npm run build` - Production build
- `npm run test` - Run Vitest unit tests
- `npm run lint:fix` - Auto-fix code style
- `npm run cards:update` - Fetch latest card data from Scryfall API

## Architecture

This app processes MTG card decklists into printable proxy sheets:

1. **Data Pipeline:** Scryfall API → `cards-minimized.json` → normalized card index
2. **Parse:** [DecklistParser.mjs](src/helpers/DecklistParser.mjs) extracts card quantities/names/sets from multiple formats
3. **UI:** Single-page Vue app with input panel + 3×3 card grid for printing
4. **Output:** Print-optimized pages with duplex DFC support

**Component Hierarchy:**
- [App.vue](src/App.vue) - Root layout + theme toggle
- [ProxyPage.vue](src/views/ProxyPage.vue) - Main container with all state
- `src/components/` - Presentational components only
- `src/helpers/` - Pure utility functions

## Code Conventions

**State Management:** No Vuex/Pinia - single component state + localStorage persistence via `bindStorage()` helper

**Card Processing:**
- Use [CardNames.mjs](src/helpers/CardNames.mjs) for name normalization (diacritics, unicode quotes, double slashes)
- Card lookups: `cards[normalized_name]` returns array of printings
- Session storage pattern: `sessionSetSelections[cardName][deckIndex]` for user printing choices

**File Extensions:** Use `.mjs` for ES modules, `.vue` for components

**Styling:** Spectre.css utilities + custom SCSS in `assets/style.scss` - no component library

**Testing:** Vitest with happy-dom environment, Vue Test Utils, mocked `$t()` for i18n

## Project-Specific Patterns

**Lazy Loading:** Import card data async: `const ScryfallDatasetAsync = () => import("../../data/cards-minimized.json")`

**Print Logic:** The `printPages` computed property builds flat slot arrays per page (each slot has `{ card, face }`). CSS flexbox wraps slots into 3×3 grids automatically. Card-back modes: `"none"` (fronts only), `"dfc"`/`"all"` (fronts+backs interspersed), `"all-pages"` (separate front/back pages for duplex). Duplex row mirroring uses CSS `direction: rtl` on `.print-grid-backs` — no JS reordering needed.

**i18n:** Manual locale management in [LocalePicker.vue](src/components/LocalePicker.vue) - validates/falls back to browser default

**Easter Eggs:** [ArnoldsApproval.vue](src/components/ArnoldsApproval.vue) detects specific cards (Griselbrand, Strip Mine, UN-sets) for themed responses

## Development Notes

- Build injects git SHA and timestamp via Vite environment variables
- Card data updates require running `npm run cards:update` + `npm run cards`  
- Images lazy load via [ImageLoader.vue](src/components/ImageLoader.vue) with placeholder states
- All business logic centralized in [ProxyPage.vue](src/views/ProxyPage.vue) for maintainability
