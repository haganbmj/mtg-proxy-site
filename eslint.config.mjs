import pluginVue from 'eslint-plugin-vue';
import stylistic from '@stylistic/eslint-plugin'

export default [
    ...pluginVue.configs['flat/strongly-recommended'],
    {
        plugins: {
            '@stylistic': stylistic,
        },
        rules: {
            "vue/max-attributes-per-line": "off",
            "@stylistic/comma-dangle": ["error", {
                "arrays": "always-multiline",
                "objects": "always-multiline",
                "functions": "always-multiline",
            }],
        },
    },
]
