<template>
  <Menubar :model="menuItems" class="z-50">
    <template #item="{ item, props }">
      <a v-ripple class="flex items-center" v-bind="props.action" :href="item.to">
        <span>{{ item.label }}</span>
      </a>
    </template>
    <template #end>
      <div class="flex items-center gap-10">
        <p class="text-2xl self-center">{{ currentDate }}</p>
      </div>
    </template>
  </Menubar>
</template>

<script setup>
/**
 * AppTopbar — верхняя панель навигации с меню и текущим временем.
 */
import { ref, onMounted, onUnmounted } from "vue";

defineProps({
  isVisible: Boolean,
});
defineEmits(["toggleCard"]);

/**
 * Элементы меню навигации.
 * @type {Array<{label: string, icon: string, to: string}>}
 */
const menuItems = [
  { label: "Solara", icon: "pi pi-home", to: "/" },
  { label: "Проекты", icon: "pi pi-search", to: "/projects" },
  { label: "Финансы", icon: "pi pi-search", to: "/finance" },
  { label: "About", icon: "pi pi-info-circle", to: "/about" },
  { label: "Dash", icon: "pi pi-info-circle", to: "/dash" },
];

/** Текущая дата/время в формате ДД.ММ.ГГГГ ЧЧ:ММ */
const currentDate = ref("");

/**
 * Форматирует дату в строку ДД.ММ.ГГГГ ЧЧ:ММ.
 * @param {Date} date
 * @returns {string}
 */
function formatDateTime(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

let intervalId = null;

onMounted(() => {
  currentDate.value = formatDateTime(new Date());
  intervalId = setInterval(() => {
    currentDate.value = formatDateTime(new Date());
  }, 60000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>