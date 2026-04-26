import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    
    if (status === 401) {
      window.location.href = '/login';
    }
    
    if (status === 403) {
      const config = error.config;
      if (config && config.throwOnError === false) {
        const errorWithMessage = new Error('Нет прав доступа');
        errorWithMessage.status = 403;
        errorWithMessage.message = 'Нет прав доступа';
        return Promise.reject(errorWithMessage);
      }
    }
    
    if (status === 409) {
      const config = error.config;
      if (config && config.throwOnError === false) {
        const errorWithMessage = new Error('Ресурс уже существует');
        errorWithMessage.status = 409;
        errorWithMessage.message = 'Ресурс уже существует';
        return Promise.reject(errorWithMessage);
      }
    }
    
    return Promise.reject(error);
  }
);

// Функция проверки доступности API
export async function isApiAvailable() {
  try {
    const { data } = await apiClient.get('/health', { timeout: 5000 });
    return data.status === 'healthy';
  } catch {
    return false;
  }
}

export default apiClient;
