import { vi } from "vitest";
import { config } from "@vue/test-utils";

// Node 25+ has a built-in localStorage stub that lacks getItem/setItem.
// Vitest's happy-dom environment doesn't override it because it's already on globalThis.
// Provide a minimal Storage implementation so tests can run on Node 25+.
if (typeof localStorage !== 'undefined' && typeof localStorage.getItem !== 'function') {
    const store = new Map();
    globalThis.localStorage = {
        getItem: (key) => store.get(key) ?? null,
        setItem: (key, value) => store.set(key, String(value)),
        removeItem: (key) => store.delete(key),
        clear: () => store.clear(),
        get length() { return store.size; },
        key: (index) => [...store.keys()][index] ?? null,
    };
}

config.global.mocks = {
    // Mock vue-i18n's primary method globally.
    $t: vi.fn((key) => key),
};
