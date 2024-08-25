import { defineConfig } from "vite";
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    plugins: [vue()],
    build: {
        sourcemap: true,
    },
    // Replacement values. These are set at build time.
    define: {
        'import.meta.env.VITE_BUILD_TIMESTAMP': JSON.stringify(new Date().toISOString()),
        'import.meta.env.VITE_BUILD_SHA': JSON.stringify('local'),
    },
});
