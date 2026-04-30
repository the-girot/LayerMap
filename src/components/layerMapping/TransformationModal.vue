<script setup>
/**
 * TransformationModal — форма редактирования transformation и algorithm.
 * Стили соответствует существующим PrimeVue dialog/panel компонентам проекта.
 */
import { watch } from "vue";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Message from "primevue/message";
import Button from "primevue/button";

const props = defineProps({
  /** Видимость модалки */
  visible: { type: Boolean, default: false },
  /** Выбранный маппинг (для заголовка) */
  mapping: { type: Object, default: null },
  /** Форма */
  form: {
    type: Object,
    default: () => ({ transformation: "", algorithm: "" }),
  },
  /** Форма была изменена */
  formTouched: { type: Boolean, default: false },
  /** Идёт сохранение */
  saving: { type: Boolean, default: false },
  /** Ошибки полей */
  fieldErrors: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["update:visible", "save", "close"]);

function handleSave() {
  emit("save");
}

function handleClose() {
  emit("close");
}

const title = "Редактирование трансформации";
</script>

<template>
  <Dialog
    :visible="visible"
    :header="title"
    modal
    :style="{ width: '600px' }"
    :closable="true"
    :draggable="false"
    :pt="{
      root: '!rounded-2xl',
      header: 'border-b border-app-border',
      footer: 'border-t border-app-border',
      content: '!p-0',
    }"
    @update:visible="(v) => { if (!v) handleClose(); }"
  >
    <!-- Mapping info -->
    <div
      v-if="mapping"
      class="border-b border-app-border bg-app-surface-hover px-6 py-3"
    >
      <div class="flex items-center gap-2 text-sm text-app-text-muted">
        <span class="font-medium text-app-text">{{ mapping.sourceTableName || `ID:${mapping.sourceTableId}` }}</span>
        <i class="pi pi-arrow-right text-xs" />
        <span class="font-medium text-app-text">{{ mapping.targetTableName || `ID:${mapping.targetTableId}` }}</span>
      </div>
    </div>

    <!-- Form -->
    <div class="space-y-5 px-6 py-5">
      <!-- Transformation -->
      <div>
        <label class="mb-1.5 block text-sm font-medium text-app-text">
          Transformation
        </label>
        <Textarea
          v-model="form.transformation"
          placeholder="SQL-выражение или описание трансформации…"
          class="w-full rounded-xl font-mono text-sm"
          :rows="4"
          auto-resize
          :invalid="!!fieldErrors.transformation"
          :pt="{ root: '!rounded-xl' }"
        />
        <Message
          v-if="fieldErrors.transformation?.length"
          severity="error"
          :closable="false"
          class="mt-2 !text-xs"
          :pt="{ root: '!rounded-lg !py-2' }"
        >
          {{ fieldErrors.transformation.join(", ") }}
        </Message>
      </div>

      <!-- Algorithm -->
      <div>
        <label class="mb-1.5 block text-sm font-medium text-app-text">
          Algorithm
        </label>
        <InputText
          v-model="form.algorithm"
          placeholder="Название или тип алгоритма…"
          class="w-full rounded-xl text-sm"
          :invalid="!!fieldErrors.algorithm"
          :pt="{ root: '!rounded-xl' }"
        />
        <Message
          v-if="fieldErrors.algorithm?.length"
          severity="error"
          :closable="false"
          class="mt-2 !text-xs"
          :pt="{ root: '!rounded-lg !py-2' }"
        >
          {{ fieldErrors.algorithm.join(", ") }}
        </Message>
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="flex items-center justify-between px-6 py-3">
        <div class="text-xs text-app-text-muted">
          <span v-if="formTouched && !saving" class="text-amber-600">● Есть несохранённые изменения</span>
          <span v-else>&nbsp;</span>
        </div>
        <div class="flex gap-2">
          <Button
            label="Отмена"
            severity="secondary"
            :disabled="saving"
            :pt="{ root: '!rounded-xl !min-h-[40px]' }"
            @click="handleClose"
          />
          <Button
            label="Сохранить"
            icon="pi pi-check"
            :loading="saving"
            :disabled="saving"
            :pt="{ root: '!rounded-xl !min-h-[40px]' }"
            @click="handleSave"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>
