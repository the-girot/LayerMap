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

const pinia = createPinia();
app.use(pinia);

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

localStorage.removeItem("access_token");

// ✅ Ждём роутер И loadUser до mount
const authStore = useAuthStore();
await Promise.all([
  router.isReady(),
  authStore.loadUser(),
]);

app.mount("#app"); // ← mount только после инициализации