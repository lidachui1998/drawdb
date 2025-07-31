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

export const deleteDiagram = async (id) => {
  const response = await api.delete(`/api/diagrams/${id}`);
  return response.data;
};
