<script setup>
/**
 * CreateMappingColumnDialog - модальное окно для создания колонки таблицы маппинга.
 */
import { ref, watch } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Dropdown from "primevue/dropdown";
import Checkbox from "primevue/checkbox";

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
    projectId: {
        type: [String, Number],
        required: true,
    },
    tableId: {
        type: [String, Number],
        default: null,
    },
});

const emit = defineEmits(["update:modelValue", "create"]);

const visible = ref(props.modelValue);
const loading = ref(false);
const isCalculated = ref(false);
const form = ref({
    name: "",
    type: "dimension",
    data_type: "string",
    description: "",
    is_calculated: false,
    formula: null,
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

watch(isCalculated, (value) => {
    form.value.is_calculated = value;
    if (!value) {
        form.value.formula = null;
    }
});

function resetForm() {
    isCalculated.value = false;
    form.value = {
        name: "",
        type: "dimension",
        data_type: "string",
        description: "",
        is_calculated: false,
        formula: null,
    };
}

async function handleSubmit() {
    if (!form.value.name.trim()) {
        return;
    }

    if (form.value.is_calculated && !form.value.formula) {
        return;
    }

    loading.value = true;
    try {
        emit("create", {
            ...form.value,
            mapping_table_id: props.tableId,
        });
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
    <Dialog v-model:visible="visible" modal header="Создать колонку таблицы" :style="{ width: '500px' }"
        :breakpoints="{ '576px': '90vw' }" :maximizable="true">
        <div class="flex flex-col gap-4">
            <div>
                <label for="column-name" class="block text-sm font-medium text-content mb-1">Название <span
                        class="text-app-error">*</span></label>
                <InputText id="column-name" v-model="form.name" placeholder="Введите название колонки" class="w-full"
                    :class="{ 'p-invalid': !form.name }" />
                <small v-if="!form.name" class="text-app-error text-xs">Название обязательно для заполнения</small>
            </div>

            <div>
                <label for="column-type" class="block text-sm font-medium text-content mb-1">Тип колонки <span
                        class="text-app-error">*</span></label>
                <Dropdown id="column-type" v-model="form.type" :options="[
                    { label: 'Измерение', value: 'dimension' },
                    { label: 'Метрика', value: 'metric' },
                ]" option-label="label" option-value="value" placeholder="Выберите тип" class="w-full" />
            </div>

            <div>
                <label for="column-data-type" class="block text-sm font-medium text-content mb-1">Тип данных <span
                        class="text-app-error">*</span></label>
                <Dropdown id="column-data-type" v-model="form.data_type" :options="[
                    { label: 'string', value: 'string' },
                    { label: 'integer', value: 'integer' },
                    { label: 'number', value: 'number' },
                    { label: 'boolean', value: 'boolean' },
                    { label: 'date', value: 'date' },
                    { label: 'datetime', value: 'datetime' },
                    { label: 'text', value: 'text' },
                ]" option-label="label" option-value="value" placeholder="Выберите тип данных" class="w-full" />
            </div>

            <div>
                <label for="column-description" class="block text-sm font-medium text-content mb-1">Описание</label>
                <Textarea id="column-description" v-model="form.description" placeholder="Введите описание колонки"
                    rows="2" class="w-full" />
            </div>

            <div class="flex items-center gap-2">
                <Checkbox id="column-calculated" v-model="isCalculated" :binary="true" />
                <label for="column-calculated" class="text-sm font-medium text-content cursor-pointer">Расчётная
                    колонка</label>
            </div>

            <div v-if="isCalculated">
                <label for="column-formula" class="block text-sm font-medium text-content mb-1">Формула <span
                        class="text-app-error">*</span></label>
                <InputText id="column-formula" v-model="form.formula"
                    placeholder="Введите формулу (например: sum(amount))" class="w-full"
                    :class="{ 'p-invalid': !form.formula }" />
                <small v-if="!form.formula" class="text-app-error text-xs">Формула обязательна для расчётных
                    колонок</small>
            </div>
        </div>

        <template #footer>
            <Button label="Отмена" icon="pi pi-times" severity="secondary" outlined @click="handleCancel" />
            <Button label="Создать" icon="pi pi-check" :loading="loading"
                :disabled="!form.name || (isCalculated && !form.formula)" @click="handleSubmit" />
        </template>
    </Dialog>
</template>
