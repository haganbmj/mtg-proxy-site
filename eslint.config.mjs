import pluginVue from 'eslint-plugin-vue';

export default [
    ...pluginVue.configs['flat/strongly-recommended'],
    {
        rules: {
            "vue/max-attributes-per-line": "off",
        }
    }
]
