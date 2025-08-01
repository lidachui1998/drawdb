import api from './axios';

export const getDiagrams = async () => {
  const response = await api.get('/api/diagrams');
  return response.data;
};

export const createDiagram = async (diagram) => {
  const response = await api.post('/api/diagrams', diagram);
  return response.data;
};

export const getDiagram = async (id) => {
  const response = await api.get(`/api/diagrams/${id}`);
  return response.data;
};

export const updateDiagram = async (id, diagram) => {
  const response = await api.put(`/api/diagrams/${id}`, diagram);
  return response.data;
};

export const shareDiagram = async (id, email) => {
  const response = await api.post(`/api/diagrams/${id}/share`, { email });
  return response.data;
};

export const generatePublicLink = async (id) => {
  const response = await api.post(`/api/diagrams/${id}/public-link`);
  return response.data;
};

export const removePublicLink = async (id) => {
  const response = await api.delete(`/api/diagrams/${id}/public-link`);
  return response.data;
};

export const getPublicDiagram = async (shareId) => {
  // Public diagrams don't require authentication
  const baseUrl = import.meta.env.VITE_BACKEND_URL;
  const response = await fetch(`${baseUrl}/api/diagrams/public/${shareId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch public diagram');
  }
  return response.json();
};

export const deleteDiagram = async (id) => {
  const response = await api.delete(`/api/diagrams/${id}`);
  return response.data;
};
