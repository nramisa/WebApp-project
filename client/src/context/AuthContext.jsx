import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ 
    token: null,
    role: null,
    userData: null,
    initialized: false
  });

  // Add this useEffect
  useEffect(() => {
    const saved = localStorage.getItem('auth');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAuth({
          ...parsed,
          initialized: true
        });
      } catch (error) {
        localStorage.removeItem('auth');
        setAuth(prev => ({ ...prev, initialized: true }));
      }
    } else {
      setAuth(prev => ({ ...prev, initialized: true }));
    }
  }, []);

  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: auth.token ? `Bearer ${auth.token}` : ''
    }
  });

  useEffect(() => {
    const initializeAuth = async () => {
      const saved = localStorage.getItem('auth');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Verify token validity if needed
          setAuth({
            ...parsed,
            initialized: true
          });
        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem('auth');
        }
      }
      setAuth(prev => ({ ...prev, initialized: true }));
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/login', { email, password });
      const authData = {
        token: response.data.token,
        role: response.data.role,
        userData: response.data.userData,
        initialized: true
      };
      localStorage.setItem('auth', JSON.stringify(authData));
      setAuth(authData);
      return true;
    } catch (error) {
      console.error('Login failed:', error.response?.data?.error || error.message);
      return false;
    }
  };

  const signup = async (email, password, role, adminSecret) => {
    try {
      const response = await api.post('/api/signup', { 
        email, 
        password, 
        role,
        adminSecret 
      });
      const authData = {
        token: response.data.token,
        role: response.data.role,
        userData: response.data.userData,
        initialized: true
      };
      localStorage.setItem('auth', JSON.stringify(authData));
      setAuth(authData);
      return true;
    } catch (error) {
      console.error('Signup failed:', error.response?.data?.error || error.message);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth');
    setAuth({
      token: null,
      role: null,
      userData: null,
      initialized: true
    });
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
      auth,
      login,
      signup,
      logout,
      api
    }}>
      {children}
    </AuthContext.Provider>
  );
};
