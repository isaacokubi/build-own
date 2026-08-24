import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/documents-reporting`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getDocuments = () => api.get('/documents');
export const createDocument = (data) => api.post('/documents', data);
export const getReports = () => api.get('/reports');
export const createReport = (data) => api.post('/reports', data);
export const getAnalyticsSummary = () => api.get('/analytics');
