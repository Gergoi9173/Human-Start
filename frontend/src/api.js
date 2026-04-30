import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getResources = () => api.get('/resources').then(res => res.data);
export const getProjects = () => api.get('/projects').then(res => res.data);
export const getRequesters = () => api.get('/requesters').then(res => res.data);
export const getFrames = () => api.get('/frames').then(res => res.data);

export const getAllocations = (date) => 
  api.get(`/allocations/${date}`).then(res => res.data);

export const createAllocation = (allocation) => 
  api.post('/allocations', allocation).then(res => res.data);

export const updateAllocation = (id, percentage) => 
  api.patch(`/allocations/${id}`, { percentage }).then(res => res.data);

export const deleteAllocation = (id) => 
  api.delete(`/allocations/${id}`).then(res => res.data);

export const exportCsvUrl = (date) => {
  if (date) {
    return `${API_BASE_URL}/export/csv?date=${date}`;
  }
  return `${API_BASE_URL}/export/csv`;
};

export const importCSV = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
