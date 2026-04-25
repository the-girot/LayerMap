<script setup>
/**
 * CreateProjectDialog - модальное окно для создания проекта.
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
});

const emit = defineEmits(["update:modelValue", "create", "error"]);

const visible = ref(props.modelValue);
const loading = ref(false);
const form = ref({
    name: "",
    description: "",
    status: "active",
});

// Ошибки валидации от сервера (422)
const serverErrors = ref({});

watch(
    () => props.modelValue,
    (value) => {
        visible.value = value;
        if (value) {
            resetForm();
        }
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
        status: "active",
    };
    serverErrors.value = {};
}

function handleServerValidationErrors(errors) {
    // Ожидаем формат: { name: ["Ошибка 1"], description: ["Ошибка 2"] }
    serverErrors.value = errors;
}

async function handleSubmit() {
    if (!form.value.name.trim()) {
        return;
    }

    loading.value = true;
    try {
        // Логирование данных для отладки
        console.log("Отправка данных проекта:", { ...form.value });
        emit("create", { ...form.value });
        resetForm();
    } catch (err) {
        // Логирование ошибки для отладки
        console.error("Ошибка при создании проекта:", err);

        // Если ошибка 422 с полями, передаем их родителю
        if (err.status === 422 && err.details) {
            // Обрабатываем ошибки валидации от Pydantic
            const errors = {};
            if (Array.isArray(err.details)) {
                err.details.forEach((detail) => {
                    const field = detail.loc?.[detail.loc.length - 1];
                    if (field && field !== "body") {
                        if (!errors[field]) {
                            errors[field] = [];
                        }
                        errors[field].push(detail.msg);
                    }
                });
            }
            if (Object.keys(errors).length > 0) {
                handleServerValidationErrors(errors);
            } else if (err.message) {
                // Если нет конкретных полей, показываем общую ошибку
                handleServerValidationErrors({ _general: [err.message] });
            }
        } else if (err.message) {
            // Общая ошибка
            handleServerValidationErrors({ _general: [err.message] });
        }
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
    <Dialog v-model:visible="visible" modal header="Создать проект" :style="{ width: '500px' }"
        :breakpoints="{ '576px': '90vw' }" :maximizable="true">
        <div class="flex flex-col gap-4">
            <!-- Общая ошибка -->
            <div v-if="serverErrors._general" class="p-3 rounded-lg bg-red-50 border border-red-200">
                <p class="text-sm text-red-700 font-medium mb-1">Ошибка создания проекта:</p>
                <ul class="text-sm text-red-600 list-disc list-inside">
                    <li v-for="(error, index) in serverErrors._general" :key="index">{{ error }}</li>
                </ul>
            </div>

            <div>
                <label for="project-name" class="block text-sm font-medium text-content mb-1">Название <span
                        class="text-app-error">*</span></label>
                <InputText id="project-name" v-model="form.name" placeholder="Введите название проекта" class="w-full"
                    :class="{ 'p-invalid': serverErrors.name }" />
                <small v-if="serverErrors.name" class="text-app-error text-xs">{{ serverErrors.name[0] }}</small>
                <small v-else-if="!form.name" class="text-app-error text-xs">Название обязательно для заполнения</small>
            </div>

            <div>
                <label for="project-description" class="block text-sm font-medium text-content mb-1">Описание</label>
                <Textarea id="project-description" v-model="form.description" placeholder="Введите описание проекта"
                    rows="3" class="w-full" :class="{ 'p-invalid': serverErrors.description }" />
                <small v-if="serverErrors.description" class="text-app-error text-xs">{{ serverErrors.description[0]
                    }}</small>
            </div>

            <div>
                <label for="project-status" class="block text-sm font-medium text-content mb-1">Статус <span
                        class="text-app-error">*</span></label>
                <Dropdown id="project-status" v-model="form.status"
                    :options="[{ label: 'Активный', value: 'active' }, { label: 'Черновик', value: 'draft' }, { label: 'Архив', value: 'archived' }]"
                    option-label="label" option-value="value" placeholder="Выберите статус" class="w-full"
                    :class="{ 'p-invalid': serverErrors.status }" />
                <small v-if="serverErrors.status" class="text-app-error text-xs">{{ serverErrors.status[0] }}</small>
            </div>
        </div>

        <template #footer>
            <Button label="Отмена" icon="pi pi-times" severity="secondary" outlined @click="handleCancel" />
            <Button label="Создать" icon="pi pi-check" :loading="loading" @click="handleSubmit" />
        </template>
    </Dialog>
</template>
