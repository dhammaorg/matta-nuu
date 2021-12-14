import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import PrimeVue from 'primevue/config'

createApp(App).use(store).use(router).mount('#app');
