import { createApp } from 'vue'
import { createPinia } from 'pinia' // <-- Tambahkan ini
import App from './App.vue'
import router from './router'

import { IonicVue } from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

const app = createApp(App)
  .use(IonicVue)
  .use(router)
  .use(createPinia()); // <-- Tambahkan ini

router.isReady().then(() => {
  app.mount('#app');
});