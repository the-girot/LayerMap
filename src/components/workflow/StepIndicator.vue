<script setup>
/**
 * StepIndicator - визуальный индикатор текущего шага многошагового процесса.
 *
 * Бизнес-логика:
 * - Отображает активный этап процесса
 * - Блокирует доступ к последующим шагам до их разблокировки
 * - Предотвращает нарушение бизнес-потока
 *
 * Props:
 * - steps: массив шагов с их состояниями
 * - currentStep: текущий активный шаг
 * - onStepClick: обработчик клика по шагу (для навигации)
 */
import { computed } from "vue";
import {
    WORKFLOW_STEPS,
    STEP_STATUS,
    COLUMN_TYPE_LABELS,
} from "@/stores/workflow";

const props = defineProps({
    /**
     * Массив шагов с их состояниями из workflow store
     * Формат: { id: string, label: string, status: 'locked' | 'active' | 'completed' }
     */
    steps: {
        type: Array,
        required: true,
        validator: (value) => {
            return value.every(
                (step) =>
                    step.id &&
                    step.label &&
                    [STEP_STATUS.LOCKED, STEP_STATUS.ACTIVE, STEP_STATUS.COMPLETED].includes(
                        step.status
                    )
            );
        },
    },
    /**
     * ID текущего активного шага
     */
    currentStep: {
        type: String,
        default: null,
    },
    /**
     * Флаг блокировки навигации по шагам
     */
    locked: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(["step-click"]);

/**
 * Обработчик клика по шагу.
 * Проверяет, можно ли перейти к этому шагу.
 * @param {object} step - Объект шага
 */
function handleStepClick(step) {
    // Бизнес-правило: нельзя перейти к заблокированному шагу
    if (step.status === STEP_STATUS.LOCKED) {
        return;
    }

    // Бизнес-правило: нельзя перейти к шагу, если предыдущий не завершён
    const stepIndex = props.steps.findIndex((s) => s.id === step.id);
    if (stepIndex > 0) {
        const prevStep = props.steps[stepIndex - 1];
        if (prevStep.status !== STEP_STATUS.COMPLETED) {
            return;
        }
    }

    emit("step-click", step);
}

/**
 * Получить CSS класс для шага на основе его статуса
 * @param {string} status - Статус шага
 * @returns {string} CSS класс
 */
function getStepClass(status) {
    return {
        "step-completed": status === STEP_STATUS.COMPLETED,
        "step-active": status === STEP_STATUS.ACTIVE,
        "step-locked": status === STEP_STATUS.LOCKED,
    };
}

/**
 * Получить иконку для шага
 * @param {string} status - Статус шага
 * @returns {string} CSS класс иконки
 */
function getStepIcon(status) {
    if (status === STEP_STATUS.COMPLETED) return "pi pi-check";
    if (status === STEP_STATUS.ACTIVE) return "pi pi-pencil";
    return "pi pi-lock";
}
</script>

<template>
    <nav class="step-indicator" aria-label="Шаги процесса">
        <ol class="step-list">
            <li v-for="(step, index) in steps" :key="step.id" class="step-item" :class="getStepClass(step.status)"
                @click="handleStepClick(step)" :aria-current="step.status === STEP_STATUS.ACTIVE ? 'step' : undefined"
                :aria-disabled="step.status === STEP_STATUS.LOCKED"
                :tabindex="step.status !== STEP_STATUS.LOCKED ? 0 : -1" @keydown.enter="handleStepClick(step)"
                @keydown.space.prevent="handleStepClick(step)">
                <!-- Номер/иконка шага -->
                <div class="step-circle">
                    <i :class="getStepIcon(step.status)" class="step-icon" />
                </div>

                <!-- Информация о шаге -->
                <div class="step-content">
                    <span class="step-label">{{ step.label }}</span>
                    <span v-if="step.description" class="step-description">{{
                        step.description
                        }}</span>
                </div>

                <!-- Соединительная линия (кроме последнего шага) -->
                <div v-if="index < steps.length - 1" class="step-connector" :class="{
                    'connector-completed': step.status === STEP_STATUS.COMPLETED,
                    'connector-active': step.status === STEP_STATUS.ACTIVE,
                    'connector-locked': step.status === STEP_STATUS.LOCKED,
                }" />
            </li>
        </ol>

        <!-- Сообщение о блокировке -->
        <div v-if="locked" class="step-locked-message">
            <i class="pi pi-lock text-app-warning" />
            <span>
                Для доступа к этому разделу необходимо завершить предыдущие шаги
            </span>
        </div>
    </nav>
</template>

<style scoped>
.step-indicator {
    width: 100%;
    padding: 1rem 0;
}

.step-list {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 0.5rem;
}

.step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    position: relative;
    cursor: default;
    transition: all 0.2s ease;
}

.step-item:not(.step-locked) {
    cursor: pointer;
}

.step-item:not(.step-locked):hover {
    transform: translateY(-2px);
}

.step-item.step-active .step-circle {
    background-color: var(--p-primary-500);
    color: white;
    box-shadow: 0 0 0 4px var(--p-primary-100);
    animation: pulse 2s infinite;
}

.step-item.step-completed .step-circle {
    background-color: var(--p-green-500);
    color: white;
}

.step-item.step-locked .step-circle {
    background-color: var(--p-surface-200);
    color: var(--p-surface-500);
}

.step-circle {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    position: relative;
    z-index: 1;
}

.step-icon {
    font-size: 0.875rem;
}

.step-content {
    margin-top: 0.5rem;
    text-align: center;
    max-width: 120px;
}

.step-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--p-text-color);
}

.step-active .step-label {
    color: var(--p-primary-600);
}

.step-completed .step-label {
    color: var(--p-green-600);
}

.step-locked .step-label {
    color: var(--p-surface-500);
}

.step-description {
    display: block;
    font-size: 0.625rem;
    color: var(--p-text-muted-color);
    margin-top: 0.25rem;
}

.step-connector {
    position: absolute;
    top: 1.25rem;
    left: 50%;
    right: -50%;
    height: 2px;
    z-index: 0;
}

.step-connector.connector-completed {
    background-color: var(--p-green-500);
}

.step-connector.connector-active {
    background-color: var(--p-primary-300);
}

.step-connector.connector-locked {
    background-color: var(--p-surface-200);
}

.step-locked-message {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1rem;
    padding: 0.75rem 1rem;
    background-color: var(--p-amber-50);
    border: 1px solid var(--p-amber-200);
    border-radius: 0.5rem;
    color: var(--p-amber-700);
    font-size: 0.75rem;
}

@keyframes pulse {

    0%,
    100% {
        box-shadow: 0 0 0 4px var(--p-primary-100);
    }

    50% {
        box-shadow: 0 0 0 8px var(--p-primary-100);
    }
}

/* Адаптивность для мобильных устройств */
@media (max-width: 640px) {
    .step-list {
        flex-direction: column;
        gap: 1rem;
    }

    .step-item {
        flex-direction: row;
        flex: none;
        width: 100%;
    }

    .step-connector {
        display: none;
    }

    .step-content {
        text-align: left;
        max-width: none;
        margin-left: 1rem;
    }
}
</style>
