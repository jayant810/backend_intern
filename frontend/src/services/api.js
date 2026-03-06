import axios from 'axios';

const VM_IP = '192.168.49.2';
const AUTH_URL = `http://${VM_IP}:30008/api/v1`;
const TASK_URL = `http://${VM_IP}:30009/api/v1`;

const api = axios.create();

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Determine which service to call based on the URL
    if (config.url.startsWith('/auth')) {
      config.baseURL = AUTH_URL;
    } else if (config.url.startsWith('/tasks')) {
      config.baseURL = TASK_URL;
    }

    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for refreshing token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post(`${AUTH_URL}/auth/refresh`, { refreshToken });
          if (res.data.success) {
            localStorage.setItem('accessToken', res.data.accessToken);
            localStorage.setItem('refreshToken', res.data.refreshToken);
            originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
            return axios(originalRequest);
          }
        } catch (refreshError) {
          // Refresh token expired, logout user
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
