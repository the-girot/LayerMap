import apiClient from './client.js';

export async function login(email, password) {
  const formData = new URLSearchParams();
  formData.append('username', email);  // OAuth2 требует поле "username"
  formData.append('password', password);

  await apiClient.post('/auth/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
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
