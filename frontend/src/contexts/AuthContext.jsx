import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user data on startup if token exists
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          if (response.data && response.data.success) {
            setUser(response.data.data);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkUserLoggedIn();
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data && response.data.success) {
        const userData = response.data.data;
        localStorage.setItem('token', userData.token);
        setUser(userData);
        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errMsg = error.response?.data?.message || 'Error al iniciar sesión';
      setLoading(false);
      return { success: false, error: errMsg };
    }
    setLoading(false);
    return { success: false, error: 'Respuesta inválida del servidor' };
  };

  // Register function
  const register = async (name, email, password, role = 'student') => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      if (response.data && response.data.success) {
        const userData = response.data.data;
        localStorage.setItem('token', userData.token);
        setUser(userData);
        return { success: true };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errMsg = error.response?.data?.message || 'Error al registrarse';
      setLoading(false);
      return { success: false, error: errMsg };
    }
    setLoading(false);
    return { success: false, error: 'Respuesta inválida del servidor' };
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Refresh User profile in real-time (sync payment gates status)
  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await api.get('/auth/me');
      if (response.data && response.data.success) {
        setUser(response.data.data);
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
