import { ref, computed } from "vue";
import { defineStore } from "pinia";
import {
  WORKFLOW_STEPS,
  STEP_ORDER,
  STEP_STATUS,
  COLUMN_TYPES,
  COLUMN_TYPE_LABELS,
  COLUMN_TYPE_COLORS,
} from "@/constants/workflow";

// Re-export для обратной совместимости
export {
  WORKFLOW_STEPS,
  STEP_STATUS,
  COLUMN_TYPES,
  COLUMN_TYPE_LABELS,
  COLUMN_TYPE_COLORS,
};

/**
 * Загрузка состояния workflow из localStorage
 * @param {number} projectId - ID проекта
 * @returns {object|null} Сохранённое состояние или null
 */
function loadWorkflowState(projectId) {
  try {
    const key = `workflow_${projectId}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

/**
 * Сохранение состояния workflow в localStorage
 * @param {number} projectId - ID проекта
 * @param {object} state - Состояние для сохранения
 */
function saveWorkflowState(projectId, state) {
  try {
    const key = `workflow_${projectId}`;
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    // Игнорируем ошибки localStorage
  }
}

/**
 * Создание начального состояния workflow для проекта
 * @param {number} projectId - ID проекта
 * @returns {object} Начальное состояние
 */
function createInitialState(projectId) {
  return {
    projectId,
    // Шаг 1 (RPI_FORM) активен по умолчанию, остальные заблокированы
    steps: {
      [WORKFLOW_STEPS.RPI_FORM]: {
        status: STEP_STATUS.ACTIVE,
        completedAt: null,
        data: null, // Здесь будет храниться ID сохранённой РПИ
      },
      [WORKFLOW_STEPS.TABLES]: {
        status: STEP_STATUS.LOCKED,
        completedAt: null,
        data: null,
      },
      [WORKFLOW_STEPS.COLUMNS]: {
        status: STEP_STATUS.LOCKED,
        completedAt: null,
        data: null,
      },
    },
    // Флаг блокировки навигации к проекту
    isProjectLocked: true,
    // ID сохранённой РПИ сущности (заполняется после шага 1)
    rpiEntityId: null,
    // Флаг предотвращения повторных отправок
    isSubmitting: false,
    // Последняя ошибка валидации
    validationError: null,
    // Временная метка последнего обновления
    updatedAt: Date.now(),
  };
}

export const useWorkflowStore = defineStore("workflow", () => {
  // Хранилище состояний workflow по projectId
  const workflows = ref({});

  // ── Computed ──────────────────────────────────────────────

  /**
   * Получить состояние workflow для конкретного проекта
   * @param {number} projectId - ID проекта
   * @returns {object} Состояние workflow
   */
  function getWorkflow(projectId) {
    if (!workflows.value[projectId]) {
      // Пробуем загрузить из localStorage
      const saved = loadWorkflowState(projectId);
      if (saved) {
        workflows.value[projectId] = saved;
      } else {
        workflows.value[projectId] = createInitialState(projectId);
      }
    }
    return workflows.value[projectId];
  }

  /**
   * Проверить, разблокирован ли доступ к проекту
   * @param {number} projectId - ID проекта
   * @returns {boolean} true если доступ разрешён
   */
  function isProjectUnlocked(projectId) {
    const workflow = getWorkflow(projectId);
    return !workflow.isProjectLocked && workflow.rpiEntityId !== null;
  }

  /**
   * Получить текущий активный шаг
   * @param {number} projectId - ID проекта
   * @returns {string} ID текущего шага
   */
  function getCurrentStep(projectId) {
    const workflow = getWorkflow(projectId);
    for (const stepId of STEP_ORDER) {
      if (workflow.steps[stepId].status === STEP_STATUS.ACTIVE) {
        return stepId;
      }
    }
    // Если все шаги завершены, возвращаем последний
    return STEP_ORDER[STEP_ORDER.length - 1];
  }

  /**
   * Получить статус конкретного шага
   * @param {number} projectId - ID проекта
   * @param {string} stepId - ID шага
   * @returns {string} Статус шага
   */
  function getStepStatus(projectId, stepId) {
    const workflow = getWorkflow(projectId);
    return workflow.steps[stepId]?.status ?? STEP_STATUS.LOCKED;
  }

  /**
   * Проверить, завершён ли шаг РПИ формы
   * @param {number} projectId - ID проекта
   * @returns {boolean}
   */
  function isRPIFormCompleted(projectId) {
    const workflow = getWorkflow(projectId);
    return (
      workflow.steps[WORKFLOW_STEPS.RPI_FORM].status === STEP_STATUS.COMPLETED
    );
  }

  /**
   * Получить ID сохранённой РПИ сущности
   * @param {number} projectId - ID проекта
   * @returns {number|null}
   */
  function getRPIEntityId(projectId) {
    const workflow = getWorkflow(projectId);
    return workflow.rpiEntityId;
  }

  /**
   * Проверить, идёт ли сейчас отправка данных
   * @param {number} projectId - ID проекта
   * @returns {boolean}
   */
  function isSubmitting(projectId) {
    const workflow = getWorkflow(projectId);
    return workflow.isSubmitting;
  }

  /**
   * Получить ошибку валидации
   * @param {number} projectId - ID проекта
   * @returns {string|null}
   */
  function getValidationError(projectId) {
    const workflow = getWorkflow(projectId);
    return workflow.validationError;
  }

  // ── Actions ───────────────────────────────────────────────

  /**
   * Завершить шаг РПИ формы и разблокировать доступ к проекту.
   * Это основной метод, который вызывается после успешного сохранения РПИ.
   *
   * @param {number} projectId - ID проекта
   * @param {object} rpiData - Данные сохранённой РПИ формы
   * @returns {boolean} true если шаг успешно завершён
   */
  function completeRPIForm(projectId, rpiData) {
    const workflow = getWorkflow(projectId);

    // Бизнес-правило: нельзя завершить РПИ форму, если уже идёт отправка
    if (workflow.isSubmitting) {
      workflow.validationError = "Отправка уже выполняется, подождите...";
      return false;
    }

    // Бизнес-правило: шаг РПИ формы должен быть активен
    if (workflow.steps[WORKFLOW_STEPS.RPI_FORM].status !== STEP_STATUS.ACTIVE) {
      workflow.validationError = "Шаг РПИ формы не активен";
      return false;
    }

    // Валидация: данные РПИ должны содержать обязательные поля
    if (!rpiData || !rpiData.name) {
      workflow.validationError = "Отсутствует обязательное поле: название РПИ";
      return false;
    }

    // Устанавливаем флаг отправки для предотвращения повторных отправок
    workflow.isSubmitting = true;
    workflow.validationError = null;

    // Имитация асинхронного сохранения (в реальности здесь будет API вызов)
    // Генерируем системный идентификатор РПИ
    const rpiEntityId = Date.now(); // В реальности: ответ от сервера с ID

    // Фиксируем статус выполнения первого шага
    workflow.steps[WORKFLOW_STEPS.RPI_FORM] = {
      status: STEP_STATUS.COMPLETED,
      completedAt: Date.now(),
      data: rpiData,
    };

    // Сохраняем идентификатор РПИ в глобальном хранилище
    workflow.rpiEntityId = rpiEntityId;

    // Автоматически разблокируем интерфейс страницы проекта
    workflow.isProjectLocked = false;

    // Разблокируем следующий шаг (таблицы)
    workflow.steps[WORKFLOW_STEPS.TABLES] = {
      status: STEP_STATUS.ACTIVE,
      completedAt: null,
      data: null,
    };

    workflow.isSubmitting = false;
    workflow.updatedAt = Date.now();

    // Сохраняем состояние в localStorage
    saveWorkflowState(projectId, workflow);

    return true;
  }

  /**
   * Завершить шаг создания таблиц и разблокировать шаг колонок.
   * @param {number} projectId - ID проекта
   * @param {object} tablesData - Данные созданных таблиц
   * @returns {boolean}
   */
  function completeTablesStep(projectId, tablesData) {
    const workflow = getWorkflow(projectId);

    // Бизнес-правило: нельзя завершить шаг таблиц, если РПИ не сохранена
    if (!isRPIFormCompleted(projectId)) {
      workflow.validationError = "Сначала сохраните форму РПИ";
      return false;
    }

    // Бизнес-правило: шаг таблиц должен быть активен
    if (workflow.steps[WORKFLOW_STEPS.TABLES].status !== STEP_STATUS.ACTIVE) {
      workflow.validationError = "Шаг создания таблиц не активен";
      return false;
    }

    // Валидация: должна быть создана хотя бы одна таблица
    if (!tablesData || !tablesData.tables || tablesData.tables.length === 0) {
      workflow.validationError = "Создайте хотя бы одну таблицу";
      return false;
    }

    workflow.isSubmitting = true;
    workflow.validationError = null;

    // Фиксируем статус выполнения шага таблиц
    workflow.steps[WORKFLOW_STEPS.TABLES] = {
      status: STEP_STATUS.COMPLETED,
      completedAt: Date.now(),
      data: tablesData,
    };

    // Разблокируем следующий шаг (колонки)
    workflow.steps[WORKFLOW_STEPS.COLUMNS] = {
      status: STEP_STATUS.ACTIVE,
      completedAt: null,
      data: null,
    };

    workflow.isSubmitting = false;
    workflow.updatedAt = Date.now();

    saveWorkflowState(projectId, workflow);

    return true;
  }

  /**
   * Завершить шаг настройки колонок.
   * @param {number} projectId - ID проекта
   * @param {object} columnsData - Данные настроенных колонок
   * @returns {boolean}
   */
  function completeColumnsStep(projectId, columnsData) {
    const workflow = getWorkflow(projectId);

    // Бизнес-правило: нельзя завершить шаг колонок, если таблицы не созданы
    if (
      workflow.steps[WORKFLOW_STEPS.TABLES].status !== STEP_STATUS.COMPLETED
    ) {
      workflow.validationError = "Сначала создайте таблицы";
      return false;
    }

    workflow.isSubmitting = true;
    workflow.validationError = null;

    // Фиксируем статус выполнения шага колонок
    workflow.steps[WORKFLOW_STEPS.COLUMNS] = {
      status: STEP_STATUS.COMPLETED,
      completedAt: Date.now(),
      data: columnsData,
    };

    workflow.isSubmitting = false;
    workflow.updatedAt = Date.now();

    saveWorkflowState(projectId, workflow);

    return true;
  }

  /**
   * Сбросить состояние workflow для проекта.
   * Используется для отката к начальному состоянию.
   * @param {number} projectId - ID проекта
   */
  function resetWorkflow(projectId) {
    workflows.value[projectId] = createInitialState(projectId);
    saveWorkflowState(projectId, workflows.value[projectId]);
  }

  /**
   * Очистить ошибку валидации.
   * @param {number} projectId - ID проекта
   */
  function clearValidationError(projectId) {
    const workflow = getWorkflow(projectId);
    workflow.validationError = null;
  }

  /**
   * Инициализировать workflow для проекта (загрузить из localStorage или создать новый).
   * @param {number} projectId - ID проекта
   */
  function initializeWorkflow(projectId) {
    getWorkflow(projectId); // Ленивая инициализация через getWorkflow
  }

  return {
    // State
    workflows,
    // Constants (экспортируем для использования в компонентах)
    WORKFLOW_STEPS,
    STEP_STATUS,
    COLUMN_TYPES,
    COLUMN_TYPE_LABELS,
    COLUMN_TYPE_COLORS,
    // Computed
    getWorkflow,
    isProjectUnlocked,
    getCurrentStep,
    getStepStatus,
    isRPIFormCompleted,
    getRPIEntityId,
    isSubmitting,
    getValidationError,
    // Actions
    completeRPIForm,
    completeTablesStep,
    completeColumnsStep,
    resetWorkflow,
    clearValidationError,
    initializeWorkflow,
  };
});
