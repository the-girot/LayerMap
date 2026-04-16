/**
 * Composable для фильтрации и пагинации РПИ-записей.
 * Вынесен из RPIMappingView для переиспользования и тестирования.
 */
import { computed, ref, watch } from "vue";

/**
 * @param {import('vue').Ref<Array>} rows - Массив РПИ-записей
 * @param {object} options - Опции
 * @param {number} options.pageSize - Размер страницы по умолчанию
 * @returns {object}
 */
export function useRPIFilters(rows, options = {}) {
  const { pageSize: defaultPageSize = 20 } = options;

  // Filter state
  const search = ref("");
  const selectedStatus = ref(null);
  const selectedOwnership = ref(null);
  const selectedMeasurementType = ref(null);
  const selectedCalculatedType = ref(null); // null | 'basic' | 'calculated'

  // Pagination state
  const pageFirst = ref(0);
  const pageSize = ref(defaultPageSize);

  /** Отфильтрованные строки */
  const filteredRows = computed(() => {
    const q = search.value.trim().toLowerCase();
    return rows.value.filter((row) => {
      const matchesSearch =
        !q ||
        (row.measurement || "").toLowerCase().includes(q) ||
        (row.measurementDescription || "").toLowerCase().includes(q) ||
        (row.objectField || "").toLowerCase().includes(q) ||
        (row.source || "").toLowerCase().includes(q) ||
        (row.comment || "").toLowerCase().includes(q);

      const matchesStatus =
        !selectedStatus.value || row.status === selectedStatus.value;
      const matchesOwnership =
        !selectedOwnership.value || row.ownership === selectedOwnership.value;
      const matchesMeasurementType =
        !selectedMeasurementType.value ||
        row.measurementType === selectedMeasurementType.value;
      const matchesCalculatedType =
        !selectedCalculatedType.value ||
        (selectedCalculatedType.value === "calculated" && row.isCalculated) ||
        (selectedCalculatedType.value === "basic" && !row.isCalculated);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesOwnership &&
        matchesMeasurementType &&
        matchesCalculatedType
      );
    });
  });

  /** Страница с данными */
  const paginatedRows = computed(() => {
    const all = filteredRows.value ?? [];
    return all.slice(pageFirst.value, pageFirst.value + pageSize.value);
  });

  /** Быстрые фильтры (метрики/измерения) */
  const quickFilters = computed(() => [
    { label: "Все", value: null, count: rows.value.length },
    {
      label: "Метрики",
      value: "Метрика",
      count: rows.value.filter((r) => r.measurementType === "Метрика").length,
    },
    {
      label: "Измерения",
      value: "Измерение",
      count: rows.value.filter((r) => r.measurementType === "Измерение").length,
    },
  ]);

  /** Счётчики статусов */
  const approvedCount = computed(
    () => rows.value.filter((r) => r.status === "approved").length,
  );
  const reviewCount = computed(
    () => rows.value.filter((r) => r.status === "review").length,
  );
  const draftCount = computed(
    () => rows.value.filter((r) => r.status === "draft").length,
  );

  /** Сбросить все фильтры */
  function resetFilters() {
    search.value = "";
    selectedStatus.value = null;
    selectedOwnership.value = null;
    selectedMeasurementType.value = null;
    selectedCalculatedType.value = null;
    pageFirst.value = 0;
  }

  /** Установить быстрый фильтр */
  function setQuickFilter(type) {
    selectedMeasurementType.value =
      selectedMeasurementType.value === type ? null : type;
    selectedStatus.value = null;
    selectedOwnership.value = null;
    pageFirst.value = 0;
  }

  /** Обработчик пагинации */
  function onPage(event) {
    pageFirst.value = event.first;
    pageSize.value = event.rows;
  }

  // Сброс пагинации при изменении фильтров
  watch(
    [
      search,
      selectedStatus,
      selectedOwnership,
      selectedMeasurementType,
      selectedCalculatedType,
    ],
    () => {
      pageFirst.value = 0;
    },
  );

  return {
    // State
    search,
    selectedStatus,
    selectedOwnership,
    selectedMeasurementType,
    selectedCalculatedType,
    pageFirst,
    pageSize,
    // Computed
    filteredRows,
    paginatedRows,
    quickFilters,
    approvedCount,
    reviewCount,
    draftCount,
    // Actions
    resetFilters,
    setQuickFilter,
    onPage,
  };
}
