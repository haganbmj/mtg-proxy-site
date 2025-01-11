import { vi } from "vitest";
import { config } from "@vue/test-utils";

config.global.mocks = {
    // Mock vue-i18n's primary method globally.
    $t: vi.fn((key) => key),
};
