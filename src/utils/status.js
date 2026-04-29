/**
 * Shared status helpers used across views.
 * Eliminates duplicated status label / severity logic.
 */

/**
 * Get PrimeVue Badge severity for project status.
 * @param {string} status
 * @returns {string}
 */
export function getProjectStatusSeverity(status) {
  switch (status) {
    case "active":
      return "success";
    case "draft":
      return "warning";
    case "archived":
      return "danger";
    default:
      return "info";
  }
}

/**
 * Get Russian label for project status.
 * @param {string} status
 * @returns {string}
 */
export function getProjectStatusLabel(status) {
  switch (status) {
    case "active":
      return "Активный";
    case "draft":
      return "Черновик";
    case "archived":
      return "Архив";
    default:
      return status;
  }
}

/**
 * Get PrimeVue Badge severity for source type.
 * @param {string} type
 * @returns {string}
 */
export function getSourceTypeSeverity(type) {
  switch (type) {
    case "API":
      return "info";
    case "DB":
      return "success";
    case "ClickHouse":
      return "success";
    case "BigQuery":
      return "info";
    case "PostgreSQL":
      return "warning";
    case "1C":
      return "danger";
    default:
      return "info";
  }
}

/**
  * Get Russian label for RPI mapping status.
  * @param {string} s
  * @returns {string}
  */
 export function getMappingStatusLabel(s) {
  switch (s) {
    case "approved":
      return "Утверждено";
    case "review":
    case "in_review":
      return "На проверке";
    case "draft":
      return "Черновик";
    default:
      return s;
  }
}

/**
  * Get CSS class for status pill (background + text + border).
  * @param {string} status
  * @returns {string}
  */
 export function getStatusPillClass(status) {
  if (status === "approved")
    return "bg-app-success-bg text-app-success-text border border-app-success-border";
  if (status === "review" || status === "in_review")
    return "bg-app-warning-bg text-app-warning-text border border-app-warning-border";
  return "bg-app-surface-hover text-app-text-muted";
}

/**
  * Get CSS class for status dot (small circle).
  * @param {string} status
  * @returns {string}
  */
 export function getStatusDotClass(status) {
  if (status === "approved") return "bg-app-success";
  if (status === "review" || status === "in_review") return "bg-app-warning";
  return "bg-content-faint";
}

/**
  * Get CSS class for active status button.
  * @param {string} status
  * @returns {string}
  */
 export function getStatusBtnActiveClass(status) {
  if (status === "approved")
    return "border-app-success-border bg-app-success-bg text-app-success-text";
  if (status === "review" || status === "in_review")
    return "border-app-warning-border bg-app-warning-bg text-app-warning-text";
  return "border-app-border bg-app-surface-hover text-app-text-secondary";
}
