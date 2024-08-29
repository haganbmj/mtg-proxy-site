import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';

import App from './App.vue';
import '../assets/style.scss';

import * as en from './locales/en.json';
import * as ptBR from './locales/pt-BR.json';

const i18n = createI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages: {
        'en': en,
        'pt-BR': ptBR,
    },
});

createApp(App)
    .use(i18n)
    .mount('#app');
