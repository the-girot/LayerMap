/**
 * Константы для РПИ-маппинга.
 * Используются в RPIMappingView и связанных компонентах.
 */

/** Опции статусов для фильтрации */
export const RPI_STATUS_OPTIONS = [
  { label: "Все статусы", value: null },
  { label: "Утверждено", value: "approved" },
  { label: "На проверке", value: "review" },
  { label: "Черновик", value: "draft" },
];

/** Опции принадлежности для фильтрации */
export const RPI_OWNERSHIP_OPTIONS = [
  { label: "Все", value: null },
  { label: "Аналитика", value: "Аналитика" },
  { label: "Маркетинг", value: "Маркетинг" },
  { label: "Гео", value: "Гео" },
  { label: "Техническое", value: "Техническое" },
];

/** Опции типов измерений для UI (английские значения) */
export const RPI_MEASUREMENT_TYPES = ["dimension", "metric"];

/** Маппинг между английскими значениями (API) и русскими кодами (UI) */
export const MEASUREMENT_TYPE_MAP = {
  dimension: "Измерение",
  metric: "Метрика",
  Измерение: "dimension",
  Метрика: "metric",
};

/** Опции принадлежности для формы */
export const RPI_OWNERSHIP_VALUES = [
  "Аналитика",
  "Маркетинг",
  "Гео",
  "Техническое",
];

/** Опции статусов для формы */
export const RPI_STATUS_VALUES = [
  { value: "approved", label: "Утв." },
  { value: "review", label: "Проверка" },
  { value: "draft", label: "Черновик" },
];

/** Начальное состояние формы */
export const createEmptyRPIForm = () => ({
  number: 0,
  ownership: "",
  status: "draft",
  source: "",
  block: "",
  measurement_type: "dimension",
  is_calculated: false,
  formula: "",
  measurement: "",
  measurement_description: "",
  source_report: "",
  object_field: "",
  source_column_id: null, // Жесткая связь с колонкой источника
  date_added: "",
  date_removed: null,
  comment: "",
  verification_file: null,
});
