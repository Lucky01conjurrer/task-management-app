import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const login = async (userData) => {
  const response = await api.post('/auth/login', userData);
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

// Lists API
export const getLists = async () => {
  const response = await api.get('/lists');
  return response.data;
};

export const createList = async (listData) => {
  const response = await api.post('/lists', listData);
  return response.data;
};

export const updateList = async (id, listData) => {
  const response = await api.put(`/lists/${id}`, listData);
  return response.data;
};

export const deleteList = async (id) => {
  const response = await api.delete(`/lists/${id}`);
  return response.data;
};

// Tasks API
export const getTasksByList = async (listId) => {
  const response = await api.get(`/lists/${listId}/tasks`);
  return response.data;
};

export const createTask = async (listId, taskData) => {
  const response = await api.post(`/lists/${listId}/tasks`, taskData);
  return response.data;
};

export const updateTask = async (id, taskData) => {
  const response = await api.put(`/tasks/${id}`, taskData);
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
};

export const moveTask = async (id, moveData) => {
  const response = await api.put(`/tasks/${id}/move`, moveData);
  return response.data;
};

export default api;
