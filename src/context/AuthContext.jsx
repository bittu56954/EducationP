import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      if (token) {
        try {
          const res = await api.getMe();
          setUser(res.user);
        } catch (err) {
          console.error('Failed to verify stored token:', err);
          logout();
        }
      }
      setLoading(false);
    }
    checkAuth();
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
    // Do not set token or user in local state or localStorage so user is not logged in automatically.
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
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const res = await api.updateProfile(profileData);
    setUser(res.user);
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
