<template>
    <div class="locale-changer">
        <select v-model="locale" class="form-select">
        <option v-for="locale in $i18n.availableLocales" :key="`locale-${locale}`" :value="locale">{{ locale }}</option>
        </select>
    </div>
</template>

<script>
export default {
    name: 'LocalePicker',
    components: {},
    data() {
        return {
            locale: undefined,
        }
    },
    watch: {
        locale(newValue) {
            // Set the vue-i18n locale at the root scope.
            this.$root.$i18n.locale = newValue;

            // Then check what comes back if we actually try to use that locale.
            const resolvedLocale = this.$t('locale');

            // If the return differs from what we set, then it either isn't supported or cascades to a different definition.
            if (this.locale != resolvedLocale) {
                this.locale = resolvedLocale;
            } else {
                localStorage.locale = newValue;
            }
        },
    },
    mounted() {
        if (localStorage.locale === undefined) {
            this.locale = navigator.language ?? navigator.userLanguage;
        } else {
            this.locale = localStorage.locale ?? undefined;
        }
    }
}
</script>
