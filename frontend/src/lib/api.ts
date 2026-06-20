import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      if (!window.location.pathname.includes('/auth/login')) {
        // Vider le store et le localStorage avant de rediriger
        localStorage.clear();
        // Importer dynamiquement pour éviter les problèmes de circular dependency
        import('@/store/authStore').then(({ useAuthStore }) => {
          useAuthStore.getState().logout();
        });
        window.location.replace('/auth/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
