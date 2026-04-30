/**
 * Composable для управления Vue Flow canvas в LayerMappingView.
 * Изолирует логику взаимодействия с графом (zoom, fitView, edge click, node click).
 */
import { ref, computed, watch } from "vue";
import { useVueFlow } from "@vue-flow/core";

/**
 * @param {import('vue').Ref<'single'|'full'>} mode - текущий режим отображения
 * @param {Function} onEdgeClick - callback при клике на ребро (открывает TransformationModal)
 * @param {Function} onNodeClick - callback при клике на узел
 * @returns {Object}
 */
export function useLayerMappingCanvas(mode, onEdgeClick, onNodeClick) {
  /** Ref на DOM-элемент контейнера Vue Flow */
  const flowInstance = ref(null);

  /** Панель видна/скрыта */
  const showMinimap = ref(false);

  /** Приближение */
  const zoomLevel = ref(1);

  /**
   * Обработчик события @edge-click из Vue Flow.
   * Пробрасывает данные ребра (transformation, algorithm) в модалку.
   */
  function handleEdgeClick(edgeEvent) {
    if (!edgeEvent?.edge?.data) return;
    onEdgeClick?.(edgeEvent.edge.data);
  }

  /**
   * Обработчик @node-click.
   */
  function handleNodeClick(nodeEvent) {
    if (!nodeEvent?.node?.data) return;
    onNodeClick?.(nodeEvent.node.data);
  }

  /** Увеличить масштаб */
  function zoomIn() {
    if (flowInstance.value) {
      flowInstance.value.zoomIn();
    }
  }

  /** Уменьшить масштаб */
  function zoomOut() {
    if (flowInstance.value) {
      flowInstance.value.zoomOut();
    }
  }

  /** Fit view всех нод */
  function fitView() {
    if (flowInstance.value) {
      flowInstance.value.fitView({ padding: 0.2 });
    }
  }

  /** Переключить мини-карту */
  function toggleMinimap() {
    showMinimap.value = !showMinimap.value;
  }

  /** Обновление zoom level при изменении */
  function onViewportChange(viewport) {
    if (viewport?.zoom) {
      zoomLevel.value = Math.round(viewport.zoom * 10) / 10;
    }
  }

  /** При переключении режима делаем fitView */
  watch(mode, () => {
    setTimeout(() => fitView(), 100);
  });

  return {
    flowInstance,
    showMinimap,
    zoomLevel,
    handleEdgeClick,
    handleNodeClick,
    zoomIn,
    zoomOut,
    fitView,
    toggleMinimap,
    onViewportChange,
  };
}
