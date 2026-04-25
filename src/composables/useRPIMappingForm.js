/**
 * Composable для управления формой РПИ (add/edit/delete).
 * Вынесен из RPIMappingView для переиспользования.
 *
 * Обеспечивает жесткую связь между РПИ-записями и полями источников:
 * - При выборе objectField автоматически заполняются measurementType, isCalculated, formula
 * - sourceColumnId хранит ID колонки для обратной связи
 */
import { reactive, ref } from "vue";
import { createEmptyRPIForm, MEASUREMENT_TYPE_MAP } from "@/constants/rpi";

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
   * Автоматически устанавливает measurement_type, is_calculated, formula.
   * @param {object} column - Колонка из MappingTable.columns
   */
  function fillFormFromColumn(column) {
    if (!column) return;
    // measurement_type: 'metric' → 'metric', 'dimension' → 'dimension' (API format)
    form.measurement_type = column.type === "metric" ? "metric" : "dimension";
    form.is_calculated = column.is_calculated || false;
    form.formula = column.is_calculated ? column.formula || "" : "";
    form.object_field = column.name;
    form.source_column_id = column.id;
    // Если есть описание в колонке - используем его
    if (column.description && !form.measurement_description) {
      form.measurement_description = column.description;
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
    if (!form.measurement || !form.object_field) return;

    // Валидация: если есть source_column_id, проверяем целостность
    if (form.source_column_id) {
      const validation = store.validateRPIMappingLink(projectId.value, {
        source_column_id: form.source_column_id,
        measurement_type: form.measurement_type,
        is_calculated: form.is_calculated,
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
        measurement_type: form.measurement_type || "dimension",
        is_calculated: form.is_calculated || false,
        formula: form.is_calculated ? form.formula || "" : "",
        measurement: form.measurement,
        measurement_description: form.measurement_description || "",
        source_report: form.source_report || "",
        object_field: form.object_field,
        source_column_id: form.source_column_id || null,
        comment: form.comment || "",
        verification_file: form.verification_file || null,
      });
    } else if (activeRow.value) {
      store.updateRPIMapping(projectId.value, activeRow.value.id, {
        ownership: form.ownership,
        status: form.status,
        source: form.source || null, // Разрешаем null для источника
        block: form.block,
        measurement_type: form.measurement_type,
        is_calculated: form.is_calculated,
        formula: form.is_calculated ? form.formula : "",
        measurement: form.measurement,
        measurement_description: form.measurement_description,
        source_report: form.source_report,
        object_field: form.object_field,
        source_column_id: form.source_column_id || null,
        comment: form.comment,
        verification_file: form.verification_file,
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
