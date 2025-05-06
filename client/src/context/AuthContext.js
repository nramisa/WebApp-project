import { createContext, useState } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem('auth');
    return saved ? JSON.parse(saved) : { token: null, role: null };
  });

  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: auth.token ? `Bearer ${auth.token}` : ''
    }
  });

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/login', { email, password });
      
      const authData = {
        token: response.data.token,
        role: response.data.role,
        userData: response.data.userData
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
        userData: response.data.userData
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
    setAuth({ token: null, role: null });
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ auth, login, signup, logout, api }}>
      {children}
    </AuthContext.Provider>
  );
};
