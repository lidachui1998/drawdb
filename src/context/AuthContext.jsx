import React, { createContext, useState, useContext, useEffect } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // You might want to verify the token with the backend here
      // For simplicity, we'll just decode it
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ email: payload.email }); // Assuming email is in the payload
      } catch (error) {
        console.error('Invalid token:', error);
        setToken(null);
        localStorage.removeItem('token');
      }
    }    setLoading(false);
  }, [token]);

  const login = async (email) => {
    await authApi.login(email);
  };

  const verify = async (email, code) => {
    const { token } = await authApi.verify(email, code);
    setToken(token);
    localStorage.setItem('token', token);
    const payload = JSON.parse(atob(token.split('.')[1]));
    setUser({ email: payload.email });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, verify, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
