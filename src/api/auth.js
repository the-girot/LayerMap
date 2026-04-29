import apiClient from './client.js';

export async function login(email, password) {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);
  formData.append('grant_type', 'password');

  // После успешного логина бек сам поставит Set-Cookie
  await apiClient.post('/auth/jwt/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
}

export async function register(data) {
  const { data: result } = await apiClient.post('/auth/register', data);
  return result;
}

export async function getMe() {
  return apiClient.get('/users/me');
}

export async function logout() {
  // Бек очистит cookie через Set-Cookie: max-age=0
  await apiClient.post('/auth/logout');
}