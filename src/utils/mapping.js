/**
 * Хелперы для работы с маппингом РПИ
 * Чистые функции без доступа к store
 */

/**
 * Получить источник по ID проекта и имени источника
 * @param {string} projectId - ID проекта
 * @param {string} sourceName - Имя источника
 * @param {Array} sources - Массив источников проекта
 * @returns {Object|null} - Объект источника или null
 */
export function getProjectSourceByProjectIdAndName(
  projectId,
  sourceName,
  sources,
) {
  if (!projectId || !sourceName || !sources) return null;
  return sources.find((s) => s.name === sourceName) || null;
}

/**
 * Получить колонку по source_column_id для записи
 * @param {Object} data - Данные записи
 * @param {string} data.source - Имя источника
 * @param {string} data.source_column_id - ID колонки
 * @param {string} projectId - ID проекта
 * @param {Array} sources - Массив источников проекта
 * @param {Array} mappingTables - Массив таблиц маппинга
 * @returns {Object|null} - Объект колонки или null
 */
export function getMappingColumnForRecord(
  data,
  projectId,
  sources,
  mappingTables,
) {
  if (
    !data?.source_column_id ||
    !data?.source ||
    !projectId ||
    !sources ||
    !mappingTables
  )
    return null;
  const source = getProjectSourceByProjectIdAndName(
    projectId,
    data.source,
    sources,
  );
  if (!source) return null;
  const table = mappingTables.find((t) => t.name === source.name);
  return table?.columns.find((c) => c.id === data.source_column_id) || null;
}

/**
 * Получить класс бейджа типа колонки
 * @param {Object} data - Данные записи
 * @param {string} data.source - Имя источника
 * @param {string} data.source_column_id - ID колонки
 * @param {string} projectId - ID проекта
 * @param {Array} sources - Массив источников проекта
 * @param {Array} mappingTables - Массив таблиц маппинга
 * @returns {string} - CSS класс бейджа
 */
export function getColumnTypeBadgeClass(
  data,
  projectId,
  sources,
  mappingTables,
) {
  const col = getMappingColumnForRecord(
    data,
    projectId,
    sources,
    mappingTables,
  );
  if (!col) return "bg-gray-100 text-gray-700";
  if (col.is_calculated) return "bg-orange-100 text-orange-700";
  if (col.type === "metric") return "bg-indigo-100 text-indigo-700";
  return "bg-emerald-100 text-emerald-700";
}

/**
 * Получить букву бейджа типа колонки
 * @param {Object} data - Данные записи
 * @param {string} data.source - Имя источника
 * @param {string} data.source_column_id - ID колонки
 * @param {string} projectId - ID проекта
 * @param {Array} sources - Массив источников проекта
 * @param {Array} mappingTables - Массив таблиц маппинга
 * @returns {string} - Буква типа колонки (P/M/D/?)
 */
export function getColumnTypeBadge(data, projectId, sources, mappingTables) {
  const col = getMappingColumnForRecord(
    data,
    projectId,
    sources,
    mappingTables,
  );
  if (!col) return "?";
  if (col.is_calculated) return "P";
  if (col.type === "metric") return "M";
  return "D";
}
