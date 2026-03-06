import axios from 'axios';

// Use environment variables for API URLs, or fallback to localhost
const AUTH_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5001/api/v1';
const TASK_URL = import.meta.env.VITE_TASK_API_URL || 'http://localhost:5002/api/v1';

const api = axios.create();

// Add a request interceptor to switch baseURL based on the path
api.interceptors.request.use(
  (config) => {
    // Determine target service
    if (config.url.includes('/auth')) {
      config.baseURL = AUTH_URL;
    } else if (config.url.includes('/tasks')) {
      config.baseURL = TASK_URL;
    } else {
      // Default fallback
      config.baseURL = AUTH_URL;
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
    // If token expired (401), try to refresh it
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          // Use the absolute AUTH_URL here to avoid recursive interceptor loops
          const res = await axios.post(`${AUTH_URL}/auth/refresh`, { refreshToken });
          if (res.data.success) {
            localStorage.setItem('accessToken', res.data.accessToken);
            localStorage.setItem('refreshToken', res.data.refreshToken);
            originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
            return axios(originalRequest);
          }
        } catch (refreshError) {
          // Refresh token expired or invalid, logout user
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
