/**
 * @file api.js
 * @description Centralized Axios instance with JWT interceptors and API endpoints.
 */
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartmess_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Error handling & token expiration
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/admin/login' && currentPath !== '/') {
        localStorage.removeItem('smartmess_token');
        localStorage.removeItem('smartmess_user');
        window.location.href = '/login?expired=true';
      }
    }
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  adminLogin: (data) => api.post('/auth/admin/login', data),
  getMe: () => api.get('/auth/me'),
};

export const studentApi = {
  getTodayMenu: () => api.get('/student/menu/today'),
  getWeeklyMenu: (startDate) => api.get('/student/menu/weekly', { params: { start_date: startDate } }),
  getRatings: () => api.get('/student/ratings'),
  createRating: (data) => api.post('/student/ratings', data),
  updateRating: (id, data) => api.put(`/student/ratings/${id}`, data),
  deleteRating: (id) => api.delete(`/student/ratings/${id}`),
  getAttendance: (month, year) => api.get('/student/attendance', { params: { month, year } }),
  markAttendance: (mealType) => api.post('/student/attendance', { meal_type: mealType }),
  getComplaints: () => api.get('/student/complaints'),
  createComplaint: (data) => api.post('/student/complaints', data),
  getProfile: () => api.get('/student/profile'),
  updateProfile: (data) => api.put('/student/profile', data),
  changePassword: (data) => api.put('/student/password', data),
};

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getMenus: (params) => api.get('/admin/menus', { params }),
  createMenu: (data) => api.post('/admin/menus', data),
  updateMenu: (id, data) => api.put(`/admin/menus/${id}`, data),
  deleteMenu: (id) => api.delete(`/admin/menus/${id}`),
  copyWeek: (data) => api.post('/admin/menus/copy-week', data),
  getStudents: (params) => api.get('/admin/students', { params }),
  verifyStudent: (id) => api.put(`/admin/students/${id}/verify`),
  rejectStudent: (id) => api.put(`/admin/students/${id}/reject`),
  blockStudent: (id) => api.put(`/admin/students/${id}/block`),
  unblockStudent: (id) => api.put(`/admin/students/${id}/unblock`),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),
  getRatings: (params) => api.get('/admin/ratings', { params }),
  getComplaints: (params) => api.get('/admin/complaints', { params }),
  respondComplaint: (id, data) => api.put(`/admin/complaints/${id}`, data),
  getAttendanceReport: (params) => api.get('/admin/attendance/report', { params }),
  exportAttendanceCSV: (params) => {
    const token = localStorage.getItem('smartmess_token');
    const query = new URLSearchParams(params).toString();
    const url = `${import.meta.env.VITE_API_URL || '/api'}/admin/attendance/export-csv?${query}`;
    // Direct browser download with auth header via fetch blob
    return fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `smartmess_attendance_${params?.date_from || 'all'}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
  },
  getAnalytics: () => api.get('/admin/analytics/summary'),
};

export default api;
