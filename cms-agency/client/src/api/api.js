import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url;
    const currentPath = window.location.pathname;

    // Only redirect on 401 if:
    // - It's NOT the auth-check endpoint (/auth/me)
    // - We're NOT already on the login page
    if (status === 401 && requestUrl !== '/auth/me' && currentPath !== '/login') {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
