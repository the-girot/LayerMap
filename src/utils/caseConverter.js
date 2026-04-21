/**
 * Утилиты для конвертации между camelCase и snake_case
 */

/**
 * Конвертировать строку из camelCase в snake_case
 * @param {string} str - Строка в camelCase
 * @returns {string} - Строка в snake_case
 */
export function camelToSnake(str) {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Конвертировать ключи объекта из camelCase в snake_case (рекурсивно)
 * @param {object} obj - Объект с ключами в camelCase
 * @returns {object} - Объект с ключами в snake_case
 */
export function convertKeysToSnake(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(convertKeysToSnake);
  }

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = camelToSnake(key);
    result[snakeKey] = convertKeysToSnake(value);
  }
  return result;
}

/**
 * Конвертировать строку из snake_case в camelCase
 * @param {string} str - Строка в snake_case
 * @returns {string} - Строка в camelCase
 */
export function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Конвертировать ключи объекта из snake_case в camelCase (рекурсивно)
 * @param {object} obj - Объект с ключами в snake_case
 * @returns {object} - Объект с ключами в camelCase
 */
export function convertKeysToCamel(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(convertKeysToCamel);
  }

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = snakeToCamel(key);
    result[camelKey] = convertKeysToCamel(value);
  }
  return result;
}
