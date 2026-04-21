<script setup>
/**
 * CreateMappingTableDialog - модальное окно для создания таблицы маппинга.
 */
import { ref, watch } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Dropdown from "primevue/dropdown";

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
    projectId: {
        type: [String, Number],
        required: true,
    },
    sources: {
        type: Array,
        default: () => [],
    },
});

const emit = defineEmits(["update:modelValue", "create"]);

const visible = ref(props.modelValue);
const loading = ref(false);
const form = ref({
    name: "",
    description: "",
    source_id: null,
});

watch(
    () => props.modelValue,
    (value) => {
        visible.value = value;
    },
);

watch(visible, (value) => {
    emit("update:modelValue", value);
    if (!value) {
        resetForm();
    }
});

function resetForm() {
    form.value = {
        name: "",
        description: "",
        source_id: null,
    };
}

async function handleSubmit() {
    if (!form.value.name.trim() || !form.value.source_id) {
        return;
    }

    loading.value = true;
    try {
        emit("create", { ...form.value, project_id: props.projectId });
        resetForm();
    } finally {
        loading.value = false;
    }
}

function handleCancel() {
    visible.value = false;
    resetForm();
}
</script>

<template>
    <Dialog v-model:visible="visible" modal header="Создать таблицу маппинга" :style="{ width: '500px' }"
        :breakpoints="{ '576px': '90vw' }" :maximizable="true">
        <div class="flex flex-col gap-4">
            <div>
                <label for="table-name" class="block text-sm font-medium text-content mb-1">Название <span
                        class="text-app-error">*</span></label>
                <InputText id="table-name" v-model="form.name" placeholder="Введите название таблицы" class="w-full"
                    :class="{ 'p-invalid': !form.name }" />
                <small v-if="!form.name" class="text-app-error text-xs">Название обязательно для заполнения</small>
            </div>

            <div>
                <label for="table-description" class="block text-sm font-medium text-content mb-1">Описание</label>
                <Textarea id="table-description" v-model="form.description" placeholder="Введите описание таблицы"
                    rows="3" class="w-full" />
            </div>

            <div>
                <label for="table-source" class="block text-sm font-medium text-content mb-1">Источник данных <span
                        class="text-app-error">*</span></label>
                <Dropdown id="table-source" v-model="form.source_id"
                    :options="sources.map((s) => ({ label: s.name, value: s.id }))" option-label="label"
                    option-value="value" placeholder="Выберите источник" class="w-full"
                    :disabled="sources.length === 0" />
                <small v-if="sources.length === 0" class="text-app-text-muted text-xs">Сначала создайте источник
                    данных</small>
                <small v-else-if="!form.source_id" class="text-app-error text-xs">Источник обязателен для выбора</small>
            </div>
        </div>

        <template #footer>
            <Button label="Отмена" icon="pi pi-times" severity="secondary" outlined @click="handleCancel" />
            <Button label="Создать" icon="pi pi-check" :loading="loading"
                :disabled="!form.name || !form.source_id || sources.length === 0" @click="handleSubmit" />
        </template>
    </Dialog>
</template>
