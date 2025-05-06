import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem('auth');
    return saved ? JSON.parse(saved) : { token: null, role: null };
  });

  const login = async (email) => {
    try {
      const role = email.includes('admin') ? 'admin' :
                   email.includes('investor') ? 'investor' : 'startup';
      const mockResponse = {
        token: 'demo-token',
        role,
        userData: { name: 'Demo User', email }
      };
      localStorage.setItem('auth', JSON.stringify(mockResponse));
      setAuth(mockResponse);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ auth, login }}>
      {children}
    </AuthContext.Provider>
  );
};
