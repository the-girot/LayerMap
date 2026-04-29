/**
 * Composable для фильтрации и пагинации РПИ-записей.
 * Вынесен из RPIMappingView для переиспользования и тестирования.
 */
import { computed, ref, watch } from "vue";

/**
 * @param {import('vue').Ref<Array>} rows - Массив РПИ-записей
 * @param {object} options - Опции
 * @param {number} options.pageSize - Размер страницы по умолчанию
 * @param {boolean} options.useServerFilters - Использовать серверную фильтрацию (по умолчанию false)
 * @returns {object}
 */
export function useRPIFilters(rows, options = {}) {
  const { pageSize: defaultPageSize = 20, useServerFilters = false } = options;

  // Filter state
  const search = ref("");
  const selectedStatus = ref(null);
  const selectedOwnership = ref(null);
  const selectedMeasurementType = ref(null);
  const selectedCalculatedType = ref(null); // null | 'basic' | 'calculated'

  // Pagination state
  const pageFirst = ref(0);
  const pageSize = ref(defaultPageSize);

  /** Получить параметры фильтрации для серверного запроса */
  function getFilterParams() {
    const params = {};
    if (search.value.trim()) {
      params.search = search.value.trim();
    }
    if (selectedStatus.value !== null) {
      params.status = selectedStatus.value;
    }
    if (selectedOwnership.value !== null) {
      params.ownership = selectedOwnership.value;
    }
    if (selectedMeasurementType.value !== null) {
      params.measurement_type = selectedMeasurementType.value;
    }
    if (selectedCalculatedType.value !== null) {
      params.is_calculated = selectedCalculatedType.value === "calculated";
    }
    return params;
  }

  /** Отфильтрованные строки (клиентская фильтрация) */
  const filteredRows = computed(() => {
    if (useServerFilters) {
      return rows.value;
    }
    const q = search.value.trim().toLowerCase();
    return rows.value.filter((row) => {
      const matchesSearch =
        !q ||
        (row.measurement || "").toLowerCase().includes(q) ||
        (row.measurement_description || "").toLowerCase().includes(q) ||
        (row.object_field || "").toLowerCase().includes(q) ||
        (row.source || "").toLowerCase().includes(q) ||
        (row.comment || "").toLowerCase().includes(q);

      const matchesStatus =
        !selectedStatus.value || row.status === selectedStatus.value;
      const matchesOwnership =
        !selectedOwnership.value || row.ownership === selectedOwnership.value;
      const matchesMeasurementType =
        !selectedMeasurementType.value ||
        row.measurement_type === selectedMeasurementType.value;
      const matchesCalculatedType =
        !selectedCalculatedType.value ||
        (selectedCalculatedType.value === "calculated" && row.is_calculated) ||
        (selectedCalculatedType.value === "basic" && !row.is_calculated);

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
  const quickFilters = computed(() => {
    if (useServerFilters) {
      return [
        { label: "Все", value: null, count: null },
        { label: "Метрики", value: "metric", count: null },
        { label: "Измерения", value: "dimension", count: null },
      ];
    }
    return [
      { label: "Все", value: null, count: rows.value.length },
      {
        label: "Метрики",
        value: "metric",
        count: rows.value.filter((r) => r.measurement_type === "metric").length,
      },
      {
        label: "Измерения",
        value: "dimension",
        count: rows.value.filter((r) => r.measurement_type === "dimension")
          .length,
      },
    ];
  });

  /** Счётчики статусов */
  const approvedCount = computed(
    () => (useServerFilters ? null : rows.value.filter((r) => r.status === "approved").length),
  );
  const reviewCount = computed(
    () => (useServerFilters ? null : rows.value.filter((r) => r.status === "review" || r.status === "in_review").length),
  );
  const draftCount = computed(
    () => (useServerFilters ? null : rows.value.filter((r) => r.status === "draft").length),
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
    getFilterParams,
  };
}
