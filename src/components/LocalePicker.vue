<template>
  <div class="locale-changer">
    <select v-model="selectedLocale" class="form-select">
      <option v-for="locale in $i18n.availableLocales" :key="`locale-${locale}`" :value="locale">
        {{ locale }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
    name: 'LocalePicker',
    components: {},
    data() {
        return {
            selectedLocale: undefined,
        }
    },
    watch: {
        selectedLocale(newValue) {
            // Set the vue-i18n locale at the root scope.
            this.$root.$i18n.locale = newValue;

            // Then check what comes back if we actually try to use that locale.
            const resolvedLocale = this.$t('locale');

            // If the return differs from what we set, then it either isn't supported or cascades to a different definition.
            if (this.selectedLocale != resolvedLocale) {
                // Which means we should circle back, set a value we _do_ support, and try again.
                this.selectedLocale = resolvedLocale;
            } else {
                localStorage.locale = newValue;
            }
        },
    },
    mounted() {
        // This isn't using the LocalStorage function because it does some circular application.
        // It might be worth adjusting that (or using some internal property to do the loopback).
        if (localStorage.locale === undefined) {
            this.selectedLocale = navigator.language ?? navigator.userLanguage;
        } else {
            this.selectedLocale = localStorage.locale;
        }
    },
}
</script>
