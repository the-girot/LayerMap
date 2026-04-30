<script setup>
/**
 * CreateDWHTableDialog — диалог создания новой DWH-таблицы.
 * Стиль соответствует существующим CreateSourceDialog / CreateMappingTableDialog.
 */
import { reactive, ref, watch } from "vue";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Select from "primevue/select";
import Message from "primevue/message";
import Button from "primevue/button";
import { LAYERS, LAYER_LABELS, LAYER_ICONS } from "@/utils/layerMapping";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  /** Ошибки валидации от API */
  fieldErrors: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["update:modelValue", "create"]);

const LAYER_OPTIONS = Object.values(LAYERS).map((layer) => ({
  label: LAYER_LABELS[layer] || layer,
  value: layer,
  icon: LAYER_ICONS[layer] || "pi pi-table",
}));

const form = reactive({
  name: "",
  layer: LAYERS.STG,
  schema: "",
  description: "",
});

const formTouched = ref(false);
const creating = ref(false);

function resetForm() {
  form.name = "";
  form.layer = LAYERS.STG;
  form.schema = "";
  form.description = "";
  formTouched.value = false;
  creating.value = false;
}

function handleCreate() {
  formTouched.value = true;
  if (!form.name.trim()) return;

  creating.value = true;
  emit("create", {
    name: form.name.trim(),
    layer: form.layer,
    schema: form.schema.trim() || undefined,
    description: form.description.trim() || undefined,
  });
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) resetForm();
  },
);

const isNameValid = () => form.name.trim().length > 0;
</script>

<template>
  <Dialog
    :visible="modelValue"
    header="Создать DWH-таблицу"
    modal
    :style="{ width: '520px' }"
    :closable="!creating"
    :pt="{
      root: '!rounded-2xl',
      header: 'border-b border-app-border',
      footer: 'border-t border-app-border',
    }"
    @update:visible="(v) => $emit('update:modelValue', v)"
  >
    <div class="space-y-4 py-4">
      <!-- Name -->
      <div>
        <label class="mb-1 block text-sm font-medium text-app-text">
          Название <span class="text-red-500">*</span>
        </label>
        <InputText
          v-model="form.name"
          placeholder="table_name"
          class="w-full rounded-xl font-mono"
          :invalid="formTouched && !isNameValid()"
          :pt="{ root: '!rounded-xl' }"
        />
        <Message
          v-if="fieldErrors.name?.length"
          severity="error"
          :closable="false"
          class="mt-2 !text-xs"
          :pt="{ root: '!rounded-lg !py-2' }"
        >
          {{ fieldErrors.name.join(", ") }}
        </Message>
      </div>

      <!-- Layer -->
      <div>
        <label class="mb-1 block text-sm font-medium text-app-text">Слой</label>
        <Select
          v-model="form.layer"
          :options="LAYER_OPTIONS"
          option-label="label"
          option-value="value"
          class="w-full rounded-xl"
          :pt="{ root: '!rounded-xl' }"
        >
          <template #option="slotProps">
            <div class="flex items-center gap-2">
              <i :class="slotProps.option.icon" class="text-primary text-sm" />
              <span>{{ slotProps.option.label }}</span>
            </div>
          </template>
        </Select>
      </div>

      <!-- Schema -->
      <div>
        <label class="mb-1 block text-sm font-medium text-app-text">
          Схема
        </label>
        <InputText
          v-model="form.schema"
          placeholder="public (опционально)"
          class="w-full rounded-xl font-mono"
          :pt="{ root: '!rounded-xl' }"
        />
      </div>

      <!-- Description -->
      <div>
        <label class="mb-1 block text-sm font-medium text-app-text">Описание</label>
        <Textarea
          v-model="form.description"
          placeholder="Краткое описание таблицы"
          class="w-full rounded-xl"
          :rows="3"
          auto-resize
          :pt="{ root: '!rounded-xl' }"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2 py-2">
        <Button
          label="Отмена"
          severity="secondary"
          :disabled="creating"
          :pt="{ root: '!rounded-xl !min-h-[40px]' }"
          @click="$emit('update:modelValue', false)"
        />
        <Button
          label="Создать"
          icon="pi pi-plus"
          :loading="creating"
          :disabled="creating || !isNameValid()"
          :pt="{ root: '!rounded-xl !min-h-[40px]' }"
          @click="handleCreate"
        />
      </div>
    </template>
  </Dialog>
</template>
