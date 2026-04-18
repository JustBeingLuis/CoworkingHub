import { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const data = await fetchApi('/api/auth/perfil');
      setUser(data);
    } catch (error) {
      setUser(null);
      localStorage.removeItem('coworking_access_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('coworking_access_token')) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (correo, password) => {
    const data = await fetchApi('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ correo, password }),
    });
    localStorage.setItem('coworking_access_token', data.accessToken);
    await fetchProfile();
  };

  const register = async (nombre, correo, password) => {
    return await fetchApi('/api/usuarios/registro', {
      method: 'POST',
      body: JSON.stringify({ nombre, correo, password }),
    });
  };

  const logout = () => {
    localStorage.removeItem('coworking_access_token');
    setUser(null);
  };

  const isAdmin = user?.rol?.toUpperCase() === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
