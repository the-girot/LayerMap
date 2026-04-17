<script setup>
import { computed } from 'vue';
import Button from 'primevue/button';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';

const props = defineProps({
    panelOpen: {
        type: Boolean,
        required: true
    },
    panelMode: {
        type: String,
        required: true
    },
    form: {
        type: Object,
        required: true,
        default: () => ({})
    },
    formTouched: {
        type: Boolean,
        required: true
    },
    projectSources: {
        type: Array,
        required: true
    },
    columnOptions: {
        type: Array,
        required: true
    },
    selectedColumn: {
        type: Object,
        default: null
    },
    selectedSourceObj: {
        type: Object,
        default: null
    },
    projectMappingTables: {
        type: Array,
        required: true
    }
});

const emit = defineEmits(['close', 'save', 'delete', 'source-change', 'field-change']);

function handleClose() {
    emit('close');
}

function handleSave() {
    emit('save');
}

function handleDelete() {
    emit('delete');
}

function handleSourceChange(value) {
    emit('source-change', value);
}

function handleFieldChange(option) {
    emit('field-change', option);
}

const ownershipOptions = ['Аналитика', 'Маркетинг', 'Гео', 'Техническое'];
const measurementTypeOptions = ['Измерение', 'Метрика'];

const statusOptions = [
    { value: 'approved', label: 'Утв.' },
    { value: 'review', label: 'Проверка' },
    { value: 'draft', label: 'Черновик' },
];
</script>

<template>
    <Transition name="side-panel">
        <div v-if="panelOpen"
            class="flex h-auto w-full shrink-0 flex-col overflow-hidden border-t border-l border-app-border md:sticky md:top-[97px] md:h-[calc(100vh-97px)] md:w-[420px] md:border-t-0">
            <!-- Panel header -->
            <div class="flex shrink-0 items-center justify-between border-b border-app-divider px-5 py-3.5">
                <div>
                    <div class="flex items-center gap-2">
                        <h2 class="text-sm font-semibold text-app-text">
                            {{ panelMode === "add" ? "Новая запись РПИ" : "Редактировать запись" }}
                        </h2>
                        <span :class="[
                            'rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide',
                            panelMode === 'add' ? 'bg-app-primary-light text-primary' : 'bg-app-surface-hover text-app-text-muted',
                        ]">{{ panelMode }}</span>
                    </div>
                    <p v-if="panelMode === 'edit' && form?.objectField"
                        class="mt-0.5 truncate font-mono text-[10px] text-app-text-muted">
                        {{ form.objectField }}
                    </p>
                </div>
                <button @click="handleClose"
                    class="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg transition-colors hover:bg-app-surface-hover">
                    <i class="pi pi-times text-xs text-app-text-muted" />
                </button>
            </div>

            <!-- Panel body -->
            <div class="flex-1 overflow-y-auto px-5 py-5">
                <div class="space-y-4">
                    <!-- Number -->
                    <div class="space-y-1.5">
                        <label class="text-[11px] font-semibold uppercase tracking-wide text-app-text-muted">
                            №
                        </label>
                        <InputText v-model="form.number" type="number" :pt="{ root: 'w-full rounded-lg text-xs' }" />
                    </div>

                    <!-- Ownership -->
                    <div class="space-y-1.5">
                        <label class="text-[11px] font-semibold uppercase tracking-wide text-app-text-muted">
                            Принадлежность
                        </label>
                        <Select v-model="form.ownership" :options="ownershipOptions" placeholder="Выберите"
                            :pt="{ root: 'w-full rounded-lg text-xs' }" />
                    </div>

                    <!-- Status -->
                    <div class="space-y-1.5">
                        <label class="text-[11px] font-semibold uppercase tracking-wide text-app-text-muted">
                            Статус
                        </label>
                        <div class="flex gap-2">
                            <button v-for="s in statusOptions" :key="s.value" @click="form.status = s.value" :class="[
                                'flex-1 rounded-lg border py-2.5 text-[10px] font-semibold transition-all min-h-[44px]',
                                form.status === s.value ? 'border-app-primary bg-app-primary text-white' : 'border-app-border text-app-text-muted hover:border-app-border-hover hover:text-app-text-secondary',
                            ]">
                                {{ s.label }}
                            </button>
                        </div>
                    </div>

                    <!-- Source -->
                    <div class="space-y-1.5">
                        <label class="text-[11px] font-semibold uppercase tracking-wide text-app-text-muted">
                            Источник данных
                        </label>
                        <Select v-model="form.source" :options="projectSources" optionLabel="name" optionValue="name"
                            placeholder="Выберите источник" :pt="{ root: 'w-full rounded-lg text-xs' }"
                            @change="(e) => handleSourceChange(e.value)">
                            <template #option="slotProps">
                                <div class="flex items-center gap-2">
                                    <span
                                        class="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-bold"
                                        :class="slotProps.option.type === 'API' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'">
                                        {{ slotProps.option.type === 'API' ? 'A' : 'D' }}
                                    </span>
                                    <div>
                                        <span class="text-xs font-medium">{{ slotProps.option.name }}</span>
                                        <span class="ml-1.5 text-[10px] text-app-text-muted">{{
                                            slotProps.option.description }}</span>
                                    </div>
                                </div>
                            </template>
                            <template #value="slotProps">
                                <div v-if="slotProps.value" class="flex items-center gap-2">
                                    <span
                                        class="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-bold"
                                        :class="selectedSourceObj?.type === 'API' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'">
                                        {{ selectedSourceObj?.type === 'API' ? 'A' : 'D' }}
                                    </span>
                                    <span class="text-xs font-medium">{{ slotProps.value }}</span>
                                </div>
                                <span v-else class="text-app-text-muted">{{ slotProps.placeholder }}</span>
                            </template>
                        </Select>
                    </div>

                    <!-- Block -->
                    <div class="space-y-1.5">
                        <label class="text-[11px] font-semibold uppercase tracking-wide text-app-text-muted">
                            Блок
                        </label>
                        <InputText v-model="form.block" placeholder="Сессии"
                            :pt="{ root: 'w-full rounded-lg text-xs' }" />
                    </div>

                    <!-- Measurement type -->
                    <div class="space-y-1.5">
                        <label class="text-[11px] font-semibold uppercase tracking-wide text-app-text-muted">
                            Тип измерения
                        </label>
                        <Select v-model="form.measurementType" :options="measurementTypeOptions" placeholder="Выберите"
                            :pt="{ root: 'w-full rounded-lg text-xs' }" />
                    </div>

                    <!-- Базовый / Расчетный (readonly при связанной колонке) -->
                    <div class="space-y-1.5">
                        <label class="text-[11px] font-semibold uppercase tracking-wide text-app-text-muted">
                            Тип показателя / измерения
                        </label>
                        <div class="flex gap-2">
                            <button @click="!selectedColumn && (form.isCalculated = false)" :disabled="!!selectedColumn"
                                :class="[
                                    'flex-1 rounded-lg border py-2.5 text-[10px] font-semibold transition-all min-h-[44px]',
                                    !form.isCalculated
                                        ? 'border-purple-300 bg-purple-50 text-purple-700'
                                        : 'border-app-border text-app-text-muted hover:border-app-border-hover hover:text-app-text-secondary',
                                    selectedColumn ? 'opacity-60 cursor-not-allowed' : '',
                                ]">
                                Базовый
                            </button>
                            <button @click="!selectedColumn && (form.isCalculated = true)" :disabled="!!selectedColumn"
                                :class="[
                                    'flex-1 rounded-lg border py-2.5 text-[10px] font-semibold transition-all min-h-[44px]',
                                    form.isCalculated
                                        ? 'border-orange-300 bg-orange-50 text-orange-700'
                                        : 'border-app-border text-app-text-muted hover:border-app-border-hover hover:text-app-text-secondary',
                                    selectedColumn ? 'opacity-60 cursor-not-allowed' : '',
                                ]">
                                Расчетный
                            </button>
                        </div>
                        <p v-if="selectedColumn" class="text-[10px] text-app-text-muted">
                            <i class="pi pi-lock text-[8px] mr-1" />
                            Тип определяется полем "{{ selectedColumn.name }}"
                        </p>
                    </div>

                    <!-- Formula (только для расчетных) -->
                    <div v-if="form.isCalculated" class="space-y-1.5">
                        <label
                            class="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-app-text-muted">
                            Формула <span class="text-app-error text-[10px] font-normal">req.</span>
                        </label>
                        <InputText v-model="form.formula" placeholder="[Показатель 1] + [Показатель 2] / 100"
                            :pt="{ root: 'w-full rounded-lg font-mono text-xs' }"
                            :class="{ 'border-app-error': formTouched && form.isCalculated && !form.formula }" />
                        <p class="text-[10px] text-app-text-muted">
                            Используйте [Имя поля] для ссылки на другие показатели
                        </p>
                    </div>

                    <!-- Measurement -->
                    <div class="space-y-1.5">
                        <label
                            class="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-app-text-muted">
                            Измерение <span class="text-app-error text-[10px] font-normal">req.</span>
                        </label>
                        <InputText v-model="form.measurement" placeholder="Идентификатор визита"
                            :pt="{ root: 'w-full rounded-lg text-xs' }"
                            :class="{ 'border-app-error': formTouched && !form.measurement }" />
                        <p v-if="selectedColumn" class="text-[10px] text-app-text-muted">
                            <i class="pi pi-link text-[8px] mr-1" />
                            Связано с полем: <span class="font-mono font-bold text-primary">{{
                                selectedColumn.name }}</span>
                            <span class="ml-1">({{ selectedColumn.dataType }})</span>
                        </p>
                    </div>

                    <!-- Description -->
                    <div class="space-y-1.5">
                        <label class="text-[11px] font-semibold uppercase tracking-wide text-app-text-muted">
                            Описание
                        </label>
                        <InputText v-model="form.measurementDescription" placeholder="Что представляет это измерение?"
                            :pt="{ root: 'w-full rounded-lg text-xs' }" />
                    </div>

                    <!-- Source report -->
                    <div class="space-y-1.5">
                        <label class="text-[11px] font-semibold uppercase tracking-wide text-app-text-muted">
                            Отчёт / Справочник
                        </label>
                        <InputText v-model="form.sourceReport" placeholder="Отчёт по визитам"
                            :pt="{ root: 'w-full rounded-lg text-xs' }" />
                    </div>

                    <!-- Object field -->
                    <div class="space-y-1.5">
                        <label
                            class="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-app-text-muted">
                            Поле источника <span class="text-app-error text-[10px] font-normal">req.</span>
                        </label>
                        <Select v-model="form.objectField" :options="columnOptions" optionLabel="label"
                            optionValue="value" placeholder="Сначала выберите источник" :disabled="!form.source"
                            :pt="{ root: 'w-full rounded-lg text-xs' }"
                            :class="{ 'border-app-error': formTouched && !form }"
                            @change="(e) => handleFieldChange(e.value)">
                            <template #option="slotProps">
                                <div class="flex items-center gap-2 py-1">
                                    <!-- Type badge -->
                                    <span
                                        class="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-bold"
                                        :class="slotProps.option.isCalculated
                                            ? 'bg-orange-100 text-orange-700'
                                            : slotProps.option.type === 'metric'
                                                ? 'bg-indigo-100 text-indigo-700'
                                                : 'bg-emerald-100 text-emerald-700'">
                                        {{ slotProps.option.isCalculated ? 'P' : slotProps.option.type ===
                                            'metric' ? 'M' : 'D' }}
                                    </span>
                                    <div class="flex-1">
                                        <span class="text-xs font-mono font-medium">{{ slotProps.option.value
                                            }}</span>
                                        <span class="ml-1.5 text-[10px] text-app-text-muted">{{
                                            slotProps.option.dataType }}</span>
                                    </div>
                                </div>
                                <p v-if="slotProps.option.description"
                                    class="ml-7 mt-0.5 text-[10px] text-app-text-muted">
                                    {{ slotProps.option.description }}
                                </p>
                            </template>
                            <template #value="slotProps">
                                <div v-if="slotProps.value" class="flex items-center gap-2">
                                    <span class="text-xs font-mono font-bold text-primary">{{ slotProps.value
                                        }}</span>
                                    <span v-if="selectedColumn" class="text-[10px] text-app-text-muted">
                                        ({{ selectedColumn.isCalculated ? 'расчетный' : 'базовый' }})
                                    </span>
                                </div>
                                <span v-else class="text-app-text-muted">
                                    {{ form.source ? 'Выберите поле' : 'Сначала выберите источник' }}
                                </span>
                            </template>
                        </Select>
                        <!-- Source indicator -->
                        <div v-if="form.source"
                            class="flex items-center gap-1.5 rounded-md bg-app-surface-hover px-2 py-1">
                            <span class="flex h-4 w-4 shrink-0 items-center justify-center rounded text-[8px] font-bold"
                                :class="selectedSourceObj?.type === 'API' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'">
                                {{ selectedSourceObj?.type === 'API' ? 'A' : 'D' }}
                            </span>
                            <span class="text-[10px] text-app-text-muted">Поля из:</span>
                            <span class="text-[10px] font-semibold text-app-text-secondary">{{
                                selectedSourceObj?.name ||
                                form.source }}</span>
                            <span class="ml-auto text-[10px] text-content-faint">{{ columnOptions.length }}
                                полей</span>
                        </div>
                    </div>

                    <!-- Comment -->
                    <div class="space-y-1.5">
                        <label class="text-[11px] font-semibold uppercase tracking-wide text-app-text-muted">
                            Комментарий
                        </label>
                        <InputText v-model="form.comment" placeholder="Дополнительные заметки"
                            :pt="{ root: 'w-full rounded-lg text-xs' }" />
                    </div>

                    <!-- Verification file -->
                    <div class="space-y-1.5">
                        <label class="text-[11px] font-semibold uppercase tracking-wide text-app-text-muted">
                            Файл для проверки
                        </label>
                        <InputText v-model="form.verificationFile" placeholder="mapping.xlsx"
                            :pt="{ root: 'w-full rounded-lg font-mono text-xs' }" />
                    </div>
                </div>
            </div>

            <!-- Panel footer -->
            <div class="flex shrink-0 items-center gap-2 border-t border-app-divider px-5 py-3.5">
                <button @click="handleClose"
                    class="min-h-[44px] text-xs text-app-text-muted transition-colors hover:bg-app-surface-hover px-3 rounded">
                    Отмена
                </button>
                <div class="flex-1" />
                <Button v-if="panelMode === 'edit'" label="Удалить" severity="danger" size="small"
                    :pt="{ root: 'rounded-lg px-4 text-xs min-h-[44px]' }" @click="handleDelete" />
                <Button :label="panelMode === 'add' ? 'Сохранить' : 'Обновить'" size="small"
                    :pt="{ root: 'rounded-lg px-4 text-xs min-h-[44px]' }" @click="handleSave" />
            </div>
        </div>
    </Transition>
</template>
