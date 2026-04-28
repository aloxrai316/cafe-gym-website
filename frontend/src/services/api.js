import axios from 'axios';

/* =========================
   🔥 PRODUCTION FIX (IMPORTANT)
   =========================
   Always use Render backend URL in production
*/
const API_URL =
  process.env.REACT_APP_API_URL ||
  'https://cafe-gym-website-2.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

/* =========================
   Attach Token Automatically
========================= */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* =========================
   Handle Unauthorized
========================= */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const path = window.location.pathname;

      if (path.startsWith('/admin')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

/* =========================
   PUBLIC APIs
========================= */

export const menuAPI = {
  getAll: (params) => api.get('/menu', { params }),
};

export const orderAPI = {
  createGuest: (data) => api.post('/orders/guest', data),
  getByTable: (tableNumber) => api.get(`/orders/table/${tableNumber}`),
  getAll: (params) => api.get('/orders', { params }),
  updateStatus: (id, status) =>
    api.patch(`/orders/${id}/status`, { status }),
};

export const waiterAPI = {
  call: (data) => api.post('/waiter/call', data),
  getActive: () => api.get('/waiter/active'),
  acknowledge: (id) => api.patch(`/waiter/${id}/acknowledge`),
  resolve: (id) => api.patch(`/waiter/${id}/resolve`),
};

export const reviewAPI = {
  create: (data) => api.post('/reviews', data),
  getAll: () => api.get('/reviews'),
};

/* =========================
   AUTH APIs
========================= */

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

/* =========================
   ADMIN APIs
========================= */

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getSalesReport: (params) =>
    api.get('/admin/reports/sales', { params }),
};

export default api;