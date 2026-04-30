/**
 * Composable для управления формой трансформации в TransformationModal.
 * Управляет dirty-флагом, сохранением, обработкой ошибок 422.
 */
import { reactive, ref, watch } from "vue";

/**
 * @param {import('vue').Ref<Object|null>} selectedMapping - выбранный маппинг из store
 * @param {Function} saveFn - функция сохранения (projectId, data) => Promise
 * @param {import('vue').Ref<string|number>} projectId
 * @returns {Object}
 */
export function useLayerMappingForm(selectedMapping, saveFn, projectId) {
  /** Поля формы */
  const form = reactive({
    transformation: "",
    algorithm: "",
  });

  /** Форма была изменена */
  const formTouched = ref(false);

  /** Идёт сохранение */
  const saving = ref(false);

  /** Ошибки полей после 422 */
  const fieldErrors = ref({});

  /** Модалка открыта */
  const modalOpen = ref(false);

  /**
   * Открыть модалку редактирования трансформации.
   */
  function openModal() {
    if (!selectedMapping.value) return;

    form.transformation = selectedMapping.value.transformation || "";
    form.algorithm = selectedMapping.value.algorithm || "";
    formTouched.value = false;
    fieldErrors.value = {};
    modalOpen.value = true;
  }

  /** Закрыть модалку */
  function closeModal() {
    modalOpen.value = false;
    formTouched.value = false;
    fieldErrors.value = {};
  }

  /** Отправить форму */
  async function saveForm() {
    if (!selectedMapping.value?.id || !projectId.value) return;

    formTouched.value = true;
    saving.value = true;
    fieldErrors.value = {};

    try {
      await saveFn(projectId.value, {
        transformation: form.transformation,
        algorithm: form.algorithm,
      });
      closeModal();
    } catch (err) {
      // Если есть fieldErrors — они уже установлены в saveTransformation
      if (err?.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          const errors = {};
          for (const d of detail) {
            if (d.loc && d.msg) {
              const field = d.loc[d.loc.length - 1];
              if (!errors[field]) errors[field] = [];
              errors[field].push(d.msg);
            }
          }
          fieldErrors.value = errors;
        }
      }
    } finally {
      saving.value = false;
    }
  }

  /** Следим за изменениями формы */
  watch(
    () => [form.transformation, form.algorithm],
    () => {
      if (modalOpen.value) {
        formTouched.value = true;
      }
    },
  );

  return {
    form,
    formTouched,
    saving,
    fieldErrors,
    modalOpen,
    openModal,
    closeModal,
    saveForm,
  };
}
