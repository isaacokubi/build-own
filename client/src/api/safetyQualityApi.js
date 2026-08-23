import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/safety-quality`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getIncidents = () => api.get('/incidents');
export const createIncident = (data) => api.post('/incidents', data);
export const getInspections = () => api.get('/inspections');
export const createInspection = (data) => api.post('/inspections', data);
export const getQualityRecords = () => api.get('/quality');
export const createQualityRecord = (data) => api.post('/quality', data);
export const createQuality = createQualityRecord;
export const getCorrectiveActions = () => api.get('/actions');
export const createCorrectiveAction = (data) => api.post('/actions', data);
export const completeCorrectiveAction = (id) => api.patch(`/actions/${id}/complete`);
