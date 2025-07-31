import api from './axios';

export const login = async (email) => {
  const response = await api.post('/api/auth/login', { email });
  return response.data;
};

export const verify = async (email, code) => {
  const response = await api.post('/api/auth/verify', { email, code });
  return response.data;
};
