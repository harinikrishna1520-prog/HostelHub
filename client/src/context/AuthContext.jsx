import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('hostelhub-token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me').then(({ data }) => setUser(data.user)).catch(() => {
      localStorage.removeItem('hostelhub-token');
    }).finally(() => setLoading(false));
  }, []);

  async function signIn(credentials) {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('hostelhub-token', data.token);
    setUser(data.user);
    return data.user;
  }

  async function signUp(details) {
    const { data } = await api.post('/auth/register', details);
    localStorage.setItem('hostelhub-token', data.token);
    setUser(data.user);
    return data.user;
  }

  function signOut() {
    localStorage.removeItem('hostelhub-token');
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);