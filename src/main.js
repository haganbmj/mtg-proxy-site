import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'

import App from './App.vue'
import '../assets/style.scss'

const i18n = createI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages: {
        'en': await import('./locales/en.json'),
        'pt-BR': await import('./locales/pt-BR.json'),
    }
});

createApp(App)
    .use(i18n)
    .mount('#app');
