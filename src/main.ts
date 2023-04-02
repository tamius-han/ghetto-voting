import { createApp } from 'vue'
import { createI18n } from 'vue-i18n';
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css';
import { messages } from './i18n/messages';

const i18n = createI18n({
  locale: 'sl',
  fallbackLocale: 'en',
  messages: messages
});

const app = createApp(App)
app.use(router)
app.use(i18n)
app.mount('#app')
