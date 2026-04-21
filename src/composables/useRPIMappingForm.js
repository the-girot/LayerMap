/**
 * Composable для управления формой РПИ (add/edit/delete).
 * Вынесен из RPIMappingView для переиспользования.
 *
 * Обеспечивает жесткую связь между РПИ-записями и полями источников:
 * - При выборе objectField автоматически заполняются measurementType, isCalculated, formula
 * - sourceColumnId хранит ID колонки для обратной связи
 */
import { reactive, ref } from "vue";
import { createEmptyRPIForm } from "@/constants/rpi";

/**
 * @param {import('vue').Ref<Array>} rows - Массив РПИ-записей
 * @param {object} store - Projects store instance
 * @param {import('vue').Ref<string>} projectId - ID проекта
 * @returns {object}
 */
export function useRPIMappingForm(rows, store, projectId) {
  const panelOpen = ref(false);
  const panelMode = ref("add"); // 'add' | 'edit'
  const activeRow = ref(null);
  const formTouched = ref(false);
  const form = reactive(createEmptyRPIForm());

  /**
   * Заполнить поля формы из выбранной колонки источника.
   * Автоматически устанавливает measurementType, isCalculated, formula.
   * @param {object} column - Колонка из MappingTable.columns
   */
  function fillFormFromColumn(column) {
    if (!column) return;
    // measurementType: 'metric' → 'Метрика', 'dimension' → 'Измерение'
    form.measurementType = column.type === "metric" ? "Метрика" : "Измерение";
    form.isCalculated = column.isCalculated || false;
    form.formula = column.isCalculated ? column.formula || "" : "";
    form.objectField = column.name;
    form.sourceColumnId = column.id;
    // Если есть описание в колонке - используем его
    if (column.description && !form.measurementDescription) {
      form.measurementDescription = column.description;
    }
  }

  /** Открыть панель добавления */
  function openAddPanel() {
    Object.assign(form, createEmptyRPIForm());
    form.number = rows.value.length + 1;
    panelMode.value = "add";
    activeRow.value = null;
    formTouched.value = false;
    panelOpen.value = true;
  }

  /** Открыть панель редактирования */
  function openEditPanel(row) {
    Object.assign(form, { ...row });
    panelMode.value = "edit";
    activeRow.value = row;
    formTouched.value = false;
    panelOpen.value = true;
  }

  /** Закрыть панель */
  function closePanel() {
    panelOpen.value = false;
    activeRow.value = null;
  }

  /** Сохранить запись с валидацией связи */
  function saveRule() {
    formTouched.value = true;
    if (!form.measurement || !form.objectField) return;

    // Валидация: если есть sourceColumnId, проверяем целостность
    if (form.sourceColumnId) {
      const validation = store.validateRPIMappingLink(projectId.value, {
        sourceColumnId: form.sourceColumnId,
        measurementType: form.measurementType,
        isCalculated: form.isCalculated,
      });
      if (!validation.valid) {
        console.warn(`[RPIMapping] Validation warning: ${validation.error}`);
        // Не блокируем сохранение, но логируем предупреждение
      }
    }

    if (panelMode.value === "add") {
      store.createRPIMapping(projectId.value, {
        ownership: form.ownership || "Аналитика",
        status: form.status || "draft",
        source: form.source || null, // Разрешаем null для источника
        block: form.block || "",
        measurementType: form.measurementType || "Измерение",
        isCalculated: form.isCalculated || false,
        formula: form.isCalculated ? form.formula || "" : "",
        measurement: form.measurement,
        measurementDescription: form.measurementDescription || "",
        sourceReport: form.sourceReport || "",
        objectField: form.objectField,
        sourceColumnId: form.sourceColumnId || null,
        comment: form.comment || "",
        verificationFile: form.verificationFile || null,
      });
    } else if (activeRow.value) {
      store.updateRPIMapping(projectId.value, activeRow.value.id, {
        ownership: form.ownership,
        status: form.status,
        source: form.source || null, // Разрешаем null для источника
        block: form.block,
        measurementType: form.measurementType,
        isCalculated: form.isCalculated,
        formula: form.isCalculated ? form.formula : "",
        measurement: form.measurement,
        measurementDescription: form.measurementDescription,
        sourceReport: form.sourceReport,
        objectField: form.objectField,
        sourceColumnId: form.sourceColumnId || null,
        comment: form.comment,
        verificationFile: form.verificationFile,
      });
    }
    closePanel();
  }

  /** Удалить запись */
  function deleteRule() {
    if (activeRow.value) {
      store.deleteRPIMapping(projectId.value, activeRow.value.id);
      closePanel();
    }
  }

  return {
    // State
    panelOpen,
    panelMode,
    activeRow,
    formTouched,
    form,
    // Actions
    openAddPanel,
    openEditPanel,
    closePanel,
    saveRule,
    deleteRule,
    fillFormFromColumn,
  };
}
