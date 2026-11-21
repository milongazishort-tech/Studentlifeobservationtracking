import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Bearer token & student's local timezone offset
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // Inject client timezone offset (in minutes from UTC)
      // e.g. UTC+6 is -360
      config.headers['x-timezone-offset'] = new Date().getTimezoneOffset();
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 unauthorized / expired tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        const isAuthPage =
          window.location.pathname.startsWith('/login') ||
          window.location.pathname.startsWith('/register') ||
          window.location.pathname.startsWith('/forgot-password') ||
          window.location.pathname.startsWith('/reset-password');

        if (!isAuthPage) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login?session_expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
