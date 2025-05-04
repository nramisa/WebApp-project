import { createContext } from 'react';

const AuthContext = createContext({
  auth: { token: null, role: null },
  setAuth: () => {}
});

export default AuthContext;
