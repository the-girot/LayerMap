import apiClient from './client.js';

export async function login(email, password) {
  await apiClient.post('/auth/login/json', { email, password });
  // Токен пришёл как cookie через Set-Cookie, не в JSON
}

export async function register(data) {
  await apiClient.post('/auth/register', data);
}

export async function getMe() {
  const { data } = await apiClient.get('/auth/me');
  return data;
}

export async function logout() {
  await apiClient.post('/auth/logout');
  // Бэкенд очистит cookie через Set-Cookie
}
