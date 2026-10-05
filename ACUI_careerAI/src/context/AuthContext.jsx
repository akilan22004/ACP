import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../utils/api';
import { clearLegacySession, findLegacyUser, removeLegacyUser } from '../utils/storage';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    clearLegacySession();
    let active = true;

    apiRequest('/api/auth/me')
      .then(({ user }) => {
        if (active) setCurrentUser(user);
      })
      .catch((error) => {
        if (active) setAuthError(error.message);
      })
      .finally(() => {
        if (active) setAuthReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = async (email, password) => {
    let user;
    try {
      ({ user } = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      }));
    } catch (error) {
      if (error.status !== 401) throw error;
      const legacyUser = findLegacyUser(email, password);
      if (!legacyUser) throw error;
      try {
        ({ user } = await apiRequest('/api/auth/register', {
          method: 'POST',
          body: { ...legacyUser, password }
        }));
      } catch (migrationError) {
        if (migrationError.status === 409) throw error;
        throw migrationError;
      }
    }
    removeLegacyUser(email);
    setCurrentUser(user);
    setAuthError('');
    return user;
  };

  const register = async (name, email, password) => {
    const { user } = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: { name, email, password }
    });
    removeLegacyUser(email);
    setCurrentUser(user);
    setAuthError('');
    return user;
  };

  const logout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setCurrentUser(null);
    }
  };

  const updateUser = async (name) => {
    const { user } = await apiRequest('/api/auth/profile', {
      method: 'PATCH',
      body: { name }
    });
    setCurrentUser(user);
    return user;
  };

  return (
    <AuthContext.Provider value={{
      currentUser, authReady, authError, login, register, logout, updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
