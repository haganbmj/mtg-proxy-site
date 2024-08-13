import pluginVue from 'eslint-plugin-vue';
import stylisticJs from '@stylistic/eslint-plugin-js'

export default [
    ...pluginVue.configs['flat/strongly-recommended'],
    {
        plugins: {
            '@stylistic/js': stylisticJs,
        },
        rules: {
            "vue/max-attributes-per-line": "off",
            "@stylistic/js/comma-dangle": ["error", {
                "arrays": "always-multiline",
                "objects": "always-multiline",
                "functions": "always-multiline",
            }],
        },
    },
]
