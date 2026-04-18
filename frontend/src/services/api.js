import axios from 'axios';

let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
if (API_URL && !API_URL.endsWith('/api') && !API_URL.endsWith('/api/')) {
  API_URL = API_URL.replace(/\/$/, '') + '/api';
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
};

export const transactionAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  getOne: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  getAnalytics: (params) => api.get('/transactions/analytics', { params }),
};

export const budgetAPI = {
  getAll: (params) => api.get('/budgets', { params }),
  getOne: (id) => api.get(`/budgets/${id}`),
  create: (data) => api.post('/budgets', data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`),
  archive: (id) => api.post(`/budgets/${id}/archive`),
  getHistory: (params) => api.get('/budgets/history', { params }),
};

export const aiAPI = {
  chat: (message) => api.post('/ai/chat', { message }),
  generateCourse: () => api.get('/ai/course'), // Endpoint dynamically generating rich financial learning JSON content
};

export const learnAPI = {
  getStats: () => api.get('/learn/stats'),
  toggleLesson: (lessonId) => api.post('/learn/toggle', { lessonId }),
};

export const goalAPI = {
  getAll: () => api.get('/goals'),
  create: (data) => api.post('/goals', data),
  delete: (id) => api.delete(`/goals/${id}`),
  update: (id, data) => api.put(`/goals/${id}`, data),
};

export default api;