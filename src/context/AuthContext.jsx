import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('bktc_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      if (token) {
        try {
          const res = await api.getMe();
          if (isMounted && res && res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('bktc_user', JSON.stringify(res.user));
          } else if (isMounted && res && res.status === 401) {
            logout();
          }
        } catch (err) {
          if (err && err.status === 401) {
            if (isMounted) logout();
          } else {
            console.warn('Network or server cold-start during auth verification; retaining cached session.');
          }
        }
      }
      if (isMounted) setLoading(false);
    }
    checkAuth();
    return () => { isMounted = false; };
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    localStorage.setItem('token', res.token);
    if (res.user) localStorage.setItem('bktc_user', JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res && res.token) {
      localStorage.setItem('token', res.token);
      if (res.user) localStorage.setItem('bktc_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const adminLogin = async (email, password) => {
    const res = await api.adminLogin({ email, password });
    localStorage.setItem('token', res.token);
    if (res.user) localStorage.setItem('bktc_user', JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const adminRegister = async () => {
    throw new Error('Admin registration is disabled. Only the designated administrator can log in.');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('bktc_user');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const res = await api.updateProfile(profileData);
    if (res && res.user) {
      setUser(res.user);
      localStorage.setItem('bktc_user', JSON.stringify(res.user));
    }
    return res;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, adminLogin, adminRegister, logout, updateProfile, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
