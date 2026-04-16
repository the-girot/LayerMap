/**
 * Константы workflow процесса.
 * Вынесены из stores/workflow.js для переиспользования в компонентах.
 */

/** Шаги workflow */
export const WORKFLOW_STEPS = {
  RPI_FORM: "rpi_form",
  TABLES: "tables",
  COLUMNS: "columns",
};

/** Порядок шагов */
export const STEP_ORDER = [
  WORKFLOW_STEPS.RPI_FORM,
  WORKFLOW_STEPS.TABLES,
  WORKFLOW_STEPS.COLUMNS,
];

/** Статусы шага */
export const STEP_STATUS = {
  LOCKED: "locked",
  ACTIVE: "active",
  COMPLETED: "completed",
};

/** Типы колонок */
export const COLUMN_TYPES = {
  METRIC: "metric",
  DIMENSION: "dimension",
};

/** Метки типов колонок */
export const COLUMN_TYPE_LABELS = {
  [COLUMN_TYPES.METRIC]: "Показатель",
  [COLUMN_TYPES.DIMENSION]: "Измерение",
};

/** Цветовые маркеры для типов колонок */
export const COLUMN_TYPE_COLORS = {
  [COLUMN_TYPES.METRIC]: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    badge: "info",
  },
  [COLUMN_TYPES.DIMENSION]: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    badge: "success",
  },
};
