/**
 * Константы для ресурсов проекта.
 * Используются в формах создания источников, таблиц маппинга, колонок и РПИ.
 */

/** Типы источников данных */
export const SOURCE_TYPE_OPTIONS = [
  { label: "API", value: "API" },
  { label: "DB", value: "DB" },
  { label: "FILE", value: "FILE" },
  { label: "STREAM", value: "STREAM" },
];

/** Начальное состояние формы источника */
export const createEmptySourceForm = () => ({
  name: "",
  description: "",
  type: "DB",
  row_count: 0,
  mapping_table_id: null,
});

/** Начальное состояние формы таблицы маппинга */
export const createEmptyMappingTableForm = () => ({
  name: "",
  description: "",
  source_id: null,
});

/** Начальное состояние формы колонки таблицы */
export const createEmptyMappingColumnForm = () => ({
  name: "",
  type: "dimension",
  data_type: "string",
  description: "",
  is_calculated: false,
  formula: null,
});

/** Типы данных для колонок */
export const COLUMN_DATA_TYPE_OPTIONS = [
  { label: "string", value: "string" },
  { label: "integer", value: "integer" },
  { label: "number", value: "number" },
  { label: "boolean", value: "boolean" },
  { label: "date", value: "date" },
  { label: "datetime", value: "datetime" },
  { label: "text", value: "text" },
];

/** Типы колонок */
export const COLUMN_TYPE_OPTIONS = [
  { label: "Измерение", value: "dimension" },
  { label: "Метрика", value: "metric" },
];
