<script setup>
/**
 * CreateSourceDialog - модальное окно для создания источника данных.
 */
import { ref, watch } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Textarea from "primevue/textarea";

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
    type: "DB",
    row_count: 0,
    mapping_table_id: null,
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
        type: "DB",
        row_count: 0,
        mapping_table_id: null,
    };
}

async function handleSubmit() {
    if (!form.value.name.trim()) {
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
    <Dialog v-model:visible="visible" modal header="Создать источник данных" :style="{ width: '500px' }"
        :breakpoints="{ '576px': '90vw' }" :maximizable="true">
        <div class="flex flex-col gap-4">
            <div>
                <label for="source-name" class="block text-sm font-medium text-content mb-1">Название <span
                        class="text-app-error">*</span></label>
                <InputText id="source-name" v-model="form.name" placeholder="Введите название источника" class="w-full"
                    :class="{ 'p-invalid': !form.name }" />
                <small v-if="!form.name" class="text-app-error text-xs">Название обязательно для заполнения</small>
            </div>

            <div>
                <label for="source-description" class="block text-sm font-medium text-content mb-1">Описание</label>
                <Textarea id="source-description" v-model="form.description" placeholder="Введите описание источника"
                    rows="3" class="w-full" />
            </div>

            <div>
                <label for="source-type" class="block text-sm font-medium text-content mb-1">Тип <span
                        class="text-app-error">*</span></label>
                <Dropdown id="source-type" v-model="form.type"
                    :options="[{ label: 'DB', value: 'DB' }, { label: 'API', value: 'API' }, { label: 'FILE', value: 'FILE' }, { label: 'STREAM', value: 'STREAM' }]"
                    option-label="label" option-value="value" placeholder="Выберите тип" class="w-full" />
            </div>

            <div>
                <label for="source-row-count" class="block text-sm font-medium text-content mb-1">Количество
                    строк</label>
                <InputText id="source-row-count" v-model.number="form.row_count" type="number" placeholder="0"
                    class="w-full" />
            </div>
        </div>

        <template #footer>
            <Button label="Отмена" icon="pi pi-times" severity="secondary" outlined @click="handleCancel" />
            <Button label="Создать" icon="pi pi-check" :loading="loading" @click="handleSubmit" />
        </template>
    </Dialog>
</template>
