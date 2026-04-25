import "@/assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "@/App.vue";
import { createAppRouter } from "@/router";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import DialogService from "primevue/dialogservice";
import ToastService from "primevue/toastservice";
import { useAuthStore } from "@/stores/auth";

const app = createApp(App);

// Создаём Pinia
const pinia = createPinia();
app.use(pinia);

// Создаём роутер
const router = createAppRouter();
app.use(router);

app.use(DialogService);
app.use(ToastService);
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

// Инициализация сессии при загрузке приложения
const authStore = useAuthStore();
router.isReady().then(() => {
  authStore.restoreSession();
});

app.mount("#app");
