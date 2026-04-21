<script setup>
/**
 * CreateRPIMappingDialog - модальное окно для создания карточки РПИ.
 */
import { ref, watch } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Textarea from "primevue/textarea";
import Dropdown from "primevue/dropdown";
import Calendar from "primevue/calendar";
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
    rpiMappings: {
        type: Array,
        default: () => [],
    },
    columns: {
        type: Array,
        default: () => [],
    },
});

const emit = defineEmits(["update:modelValue", "create"]);

const visible = ref(props.modelValue);
const loading = ref(false);
const isCalculated = ref(false);
const form = ref({
    number: 0,
    ownership: "",
    status: "draft",
    block: "",
    measurement_type: "Метрика",
    is_calculated: false,
    formula: null,
    measurement: "",
    measurement_description: "",
    source_report: "",
    object_field: "",
    source_column_id: null,
    date_added: new Date().toISOString().split("T")[0],
    date_removed: null,
    comment: "",
    verification_file: null,
});

const ownershipOptions = [
    { label: "Аналитика", value: "Аналитика" },
    { label: "Маркетинг", value: "Маркетинг" },
    { label: "Гео", value: "Гео" },
    { label: "Финансовый департамент", value: "Финансовый департамент" },
    { label: "Техническое", value: "Техническое" },
];

const statusOptions = [
    { label: "Черновик", value: "draft" },
    { label: "На проверке", value: "in_review" },
    { label: "Утверждено", value: "approved" },
];

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
    const nextNumber =
        props.rpiMappings.length > 0
            ? Math.max(...props.rpiMappings.map((m) => m.number)) + 1
            : 1;

    form.value = {
        number: nextNumber,
        ownership: "",
        status: "draft",
        block: "",
        measurement_type: "Метрика",
        is_calculated: false,
        formula: null,
        measurement: "",
        measurement_description: "",
        source_report: "",
        object_field: "",
        source_column_id: null,
        date_added: new Date().toISOString().split("T")[0],
        date_removed: null,
        comment: "",
        verification_file: null,
    };
}

async function handleSubmit() {
    if (
        !form.value.ownership ||
        !form.value.measurement ||
        !form.value.measurement_description ||
        !form.value.object_field
    ) {
        return;
    }

    if (form.value.is_calculated && !form.value.formula) {
        return;
    }

    loading.value = true;
    try {
        emit("create", {
            ...form.value,
            project_id: props.projectId,
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
    <Dialog v-model:visible="visible" modal header="Создать карточку РПИ" :style="{ width: '600px' }"
        :breakpoints="{ '576px': '90vw' }" :maximizable="true">
        <div class="flex flex-col gap-4">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label for="rpi-number" class="block text-sm font-medium text-content mb-1">Номер РПИ <span
                            class="text-app-error">*</span></label>
                    <InputNumber id="rpi-number" v-model="form.number" mode="decimal" :show-buttons="true" :min="1"
                        class="w-full" />
                </div>

                <div>
                    <label for="rpi-status" class="block text-sm font-medium text-content mb-1">Статус <span
                            class="text-app-error">*</span></label>
                    <Dropdown id="rpi-status" v-model="form.status" :options="statusOptions" option-label="label"
                        option-value="value" placeholder="Выберите статус" class="w-full" />
                </div>
            </div>

            <div>
                <label for="rpi-ownership" class="block text-sm font-medium text-content mb-1">Владелец <span
                        class="text-app-error">*</span></label>
                <Dropdown id="rpi-ownership" v-model="form.ownership" :options="ownershipOptions" option-label="label"
                    option-value="value" placeholder="Выберите владельца" class="w-full" />
            </div>

            <div>
                <label for="rpi-block" class="block text-sm font-medium text-content mb-1">Блок</label>
                <InputText id="rpi-block" v-model="form.block" placeholder="Например: Блок 1" class="w-full" />
            </div>

            <div>
                <label for="rpi-measurement-type" class="block text-sm font-medium text-content mb-1">Тип измерения
                    <span class="text-app-error">*</span></label>
                <Dropdown id="rpi-measurement-type" v-model="form.measurement_type" :options="[
                    { label: 'Измерение', value: 'Измерение' },
                    { label: 'Метрика', value: 'Метрика' },
                ]" option-label="label" option-value="value" placeholder="Выберите тип" class="w-full" />
            </div>

            <div>
                <label for="rpi-measurement" class="block text-sm font-medium text-content mb-1">Название показателя
                    <span class="text-app-error">*</span></label>
                <InputText id="rpi-measurement" v-model="form.measurement" placeholder="Например: Выручка"
                    class="w-full" />
            </div>

            <div>
                <label for="rpi-measurement-description" class="block text-sm font-medium text-content mb-1">Описание
                    показателя <span class="text-app-error">*</span></label>
                <Textarea id="rpi-measurement-description" v-model="form.measurement_description"
                    placeholder="Подробное описание показателя" rows="2" class="w-full" />
            </div>

            <div>
                <label for="rpi-object-field" class="block text-sm font-medium text-content mb-1">Поле объекта <span
                        class="text-app-error">*</span></label>
                <InputText id="rpi-object-field" v-model="form.object_field" placeholder="Например: revenue"
                    class="w-full" />
            </div>

            <div>
                <label for="rpi-source-report" class="block text-sm font-medium text-content mb-1">Источник
                    отчёта</label>
                <InputText id="rpi-source-report" v-model="form.source_report" placeholder="Например: Отчёт 123"
                    class="w-full" />
            </div>

            <div>
                <label for="rpi-source-column" class="block text-sm font-medium text-content mb-1">Связь с колонкой
                    источника</label>
                <Dropdown id="rpi-source-column" v-model="form.source_column_id" :options="columns.map((c) => ({
                    label: `${c.name} (${c.type}, ${c.data_type})`,
                    value: c.id,
                }))" option-label="label" option-value="value" placeholder="Выберите колонку" class="w-full"
                    :disabled="columns.length === 0" />
                <small v-if="columns.length === 0" class="text-app-text-muted text-xs">Сначала создайте колонку в
                    таблице маппинга</small>
            </div>

            <div>
                <label for="rpi-date-added" class="block text-sm font-medium text-content mb-1">Дата добавления</label>
                <Calendar id="rpi-date-added" v-model="form.date_added" dateFormat="dd.mm.yy" class="w-full" />
            </div>

            <div class="flex items-center gap-2">
                <Checkbox id="rpi-calculated" v-model="isCalculated" :binary="true" />
                <label for="rpi-calculated" class="text-sm font-medium text-content cursor-pointer">Расчётный
                    показатель</label>
            </div>

            <div v-if="isCalculated">
                <label for="rpi-formula" class="block text-sm font-medium text-content mb-1">Формула <span
                        class="text-app-error">*</span></label>
                <InputText id="rpi-formula" v-model="form.formula" placeholder="Например: sum(amount) / count(id)"
                    class="w-full" :class="{ 'p-invalid': !form.formula }" />
                <small v-if="!form.formula" class="text-app-error text-xs">Формула обязательна для расчётных
                    показателей</small>
            </div>

            <div>
                <label for="rpi-comment" class="block text-sm font-medium text-content mb-1">Комментарий</label>
                <Textarea id="rpi-comment" v-model="form.comment" placeholder="Дополнительные комментарии" rows="2"
                    class="w-full" />
            </div>
        </div>

        <template #footer>
            <Button label="Отмена" icon="pi pi-times" severity="secondary" outlined @click="handleCancel" />
            <Button label="Создать" icon="pi pi-check" :loading="loading" :disabled="!form.ownership ||
                !form.measurement ||
                !form.measurement_description ||
                !form.object_field ||
                (isCalculated && !form.formula)
                " @click="handleSubmit" />
        </template>
    </Dialog>
</template>
