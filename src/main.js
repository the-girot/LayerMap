import "@/assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "@/App.vue";
import { createAppRouter } from "@/router";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import DialogService from "primevue/dialogservice";

const app = createApp(App);

// Создаём Pinia
const pinia = createPinia();
app.use(pinia);

// Создаём роутер (без guards — все страницы доступны свободно)
const router = createAppRouter();
app.use(router);

app.use(DialogService);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: "p",
      darkModeSelector: ".p-dark",
      cssLayer: false,
    },
  },
});

app.mount("#app");
