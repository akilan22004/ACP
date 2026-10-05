import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../utils/api';

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    let active = true;
    apiRequest('/api/admin/me')
      .then(({ admin }) => {
        if (active) setCurrentAdmin(admin || null);
      })
      .catch((error) => {
        if (active) {
          setCurrentAdmin(null);
          setAuthError(error.message);
        }
      })
      .finally(() => {
        if (active) setAuthReady(true);
      });

    return () => { active = false; };
  }, []);

  const login = async (email, password) => {
    const { admin } = await apiRequest('/api/admin/login', {
      method: 'POST',
      body: { email, password }
    });
    setCurrentAdmin(admin);
    setAuthError('');
    return admin;
  };

  const logout = async () => {
    try {
      await apiRequest('/api/admin/logout', { method: 'POST' });
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setCurrentAdmin(null);
    }
  };

  return (
    <AdminAuthContext.Provider value={{ currentAdmin, authReady, authError, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
