import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export const getApiError = (error, fallbackMessage) => {
  const responseData = error?.response?.data;

  if (responseData?.fields) {
    return {
      message: responseData.error || fallbackMessage,
      fields: responseData.fields,
    };
  }

  return {
    message: responseData?.error || error?.message || fallbackMessage,
    fields: {},
  };
};

export default api;
