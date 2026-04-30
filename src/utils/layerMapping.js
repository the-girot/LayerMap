/**
 * Константы, типы и хелперы для модуля Layer Mapping.
 *
 * Содержит:
 * - Цвета по слоям данных (STG, ODS, DDS, DM)
 * - Иконки слоёв
 * - Подписи режимов (single / full)
 * - Типы связей
 * - Функции преобразования данных для canvas (nodes/edges из lineage API)
 */

// ───────────────────────────────────────────────────────────────
// Слои данных
// ───────────────────────────────────────────────────────────────

/** @enum {string} */
export const LAYERS = {
  STG: "stg",
  ODS: "ods",
  DDS: "dds",
  DM: "dm",
};

/** Порядок слоёв для колонковой раскладки FullLineageCanvas */
export const LAYER_ORDER = [LAYERS.STG, LAYERS.ODS, LAYERS.DDS, LAYERS.DM];

/** Человекочитаемые подписи слоёв */
export const LAYER_LABELS = {
  [LAYERS.STG]: "STG (Staging)",
  [LAYERS.ODS]: "ODS (Operational Data Store)",
  [LAYERS.DDS]: "DDS (Detail Data Store)",
  [LAYERS.DM]: "DM (Data Mart)",
};

/** Цвета в Tailwind-формате: фон, текст, граница */
export const LAYER_COLORS = {
  [LAYERS.STG]: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", hex: "#DBEAFE" },
  [LAYERS.ODS]: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", hex: "#DCFCE7" },
  [LAYERS.DDS]: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", hex: "#F3E8FF" },
  [LAYERS.DM]:  { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", hex: "#FEF3C7" },
};

/** Иконки PrimeIcons для каждого слоя */
export const LAYER_ICONS = {
  [LAYERS.STG]: "pi pi-inbox",
  [LAYERS.ODS]: "pi pi-database",
  [LAYERS.DDS]: "pi pi-table",
  [LAYERS.DM]:  "pi pi-chart-bar",
};

// ───────────────────────────────────────────────────────────────
// Режимы отображения
// ───────────────────────────────────────────────────────────────

/** @enum {string} */
export const VIEW_MODES = {
  SINGLE: "single",
  FULL: "full",
};

export const VIEW_MODE_LABELS = {
  [VIEW_MODES.SINGLE]: "Single Mapping",
  [VIEW_MODES.FULL]: "Full Lineage",
};

// ───────────────────────────────────────────────────────────────
// Типы связей (edges)
// ───────────────────────────────────────────────────────────────

export const EDGE_TYPES = {
  DEFAULT: "default",
  TRANSFORM: "transform",
};

export const EDGE_LABELS = {
  [EDGE_TYPES.DEFAULT]: "Прямая",
  [EDGE_TYPES.TRANSFORM]: "Трансформация",
};

// ───────────────────────────────────────────────────────────────
// Преобразование данных для canvas
// ───────────────────────────────────────────────────────────────

/**
 * Конвертировать данные lineage из API во Vue Flow nodes/edges.
 * Каждый узел позиционируется по слою (колонка) и индексу внутри слоя.
 *
 * @param {Object} lineage - { nodes: Array<{id, tableId, label, layer}>, edges: Array<{id, source, target, transformation?, algorithm?}> }
 * @returns {{ nodes: Array, edges: Array }}
 */
export function lineageToFlowData(lineage) {
  if (!lineage) return { nodes: [], edges: [] };

  const { nodes: rawNodes = [], edges: rawEdges = [] } = lineage;

  // Группируем узлы по слоям
  const grouped = {};
  for (const node of rawNodes) {
    const layer = node.layer || "stg";
    if (!grouped[layer]) grouped[layer] = [];
    grouped[layer].push(node);
  }

  // Позиционирование: X фиксирован по слою, Y по индексу
  const X_OFFSET = 300;
  const Y_OFFSET = 120;
  const Y_GAP = 140;

  const layerIndexMap = {};
  for (const [i, layer] of LAYER_ORDER.entries()) {
    layerIndexMap[layer] = i;
  }

  const nodes = rawNodes.map((raw, idx) => {
    const layer = raw.layer || "stg";
    const layerIdx = layerIndexMap[layer] ?? 0;
    const group = grouped[layer] || [];
    const posInLayer = group.indexOf(raw);

    return {
      id: String(raw.id || raw.tableId || idx),
      type: "erTable",
      position: {
        x: layerIdx * X_OFFSET + 40,
        y: posInLayer * Y_GAP + Y_OFFSET,
      },
      data: {
        label: raw.label || raw.name || `Node ${idx}`,
        layer,
        tableId: raw.tableId,
        columns: raw.columns || [],
        description: raw.description || "",
      },
    };
  });

  const edges = rawEdges.map((raw) => ({
    id: String(raw.id),
    source: String(raw.source),
    target: String(raw.target),
    type: EDGE_TYPES.TRANSFORM,
    animated: true,
    style: { stroke: "#6366f1", strokeWidth: 2 },
    data: {
      mappingId: raw.mappingId || raw.id,
      transformation: raw.transformation || "",
      algorithm: raw.algorithm || "",
    },
  }));

  return { nodes, edges };
}

/**
 * Преобразовать один маппинг для SingleMappingCanvas.
 *
 * @param {Object} mapping - { sourceTable, targetTable, transformation, algorithm }
 * @returns {{ nodes: Array, edges: Array }}
 */
export function singleMappingToFlowData(mapping) {
  if (!mapping) return { nodes: [], edges: [] };

  const { sourceTable, targetTable, transformation, algorithm } = mapping;

  const nodes = [];
  const edges = [];

  if (sourceTable) {
    nodes.push({
      id: `source-${sourceTable.id}`,
      type: "erTable",
      position: { x: 0, y: 80 },
      data: {
        label: sourceTable.label || sourceTable.name || "Source",
        layer: sourceTable.layer || "stg",
        tableId: sourceTable.id,
        columns: sourceTable.columns || [],
        description: sourceTable.description || "",
      },
    });
  }

  if (targetTable) {
    nodes.push({
      id: `target-${targetTable.id}`,
      type: "erTable",
      position: { x: 500, y: 80 },
      data: {
        label: targetTable.label || targetTable.name || "Target",
        layer: targetTable.layer || "dds",
        tableId: targetTable.id,
        columns: targetTable.columns || [],
        description: targetTable.description || "",
      },
    });
  }

  if (nodes.length === 2) {
    edges.push({
      id: `edge-${mapping.id || "single"}`,
      source: nodes[0].id,
      target: nodes[1].id,
      type: EDGE_TYPES.TRANSFORM,
      animated: true,
      style: { stroke: "#6366f1", strokeWidth: 2 },
      data: {
        mappingId: mapping.id,
        transformation: transformation || "",
        algorithm: algorithm || "",
      },
    });
  }

  return { nodes, edges };
}

/**
 * Проверить, valid ли объект для создания mapping.
 * @param {Object} data
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateMappingForm(data) {
  const errors = [];

  if (!data.sourceTableId) {
    errors.push("Не выбрана исходная таблица");
  }
  if (!data.targetTableId) {
    errors.push("Не выбрана целевая таблица");
  }
  if (data.sourceTableId === data.targetTableId) {
    errors.push("Исходная и целевая таблицы не могут совпадать");
  }

  return { valid: errors.length === 0, errors };
}
