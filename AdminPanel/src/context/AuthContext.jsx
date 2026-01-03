import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use sessionStorage for auto-logout on tab/window close
    const token = sessionStorage.getItem('admin-token');
    const user = sessionStorage.getItem('admin-user');
    if (token && user) {
      try {
        setAdmin(JSON.parse(user));
      } catch {
        setAdmin(null);
      }
    }
    setLoading(false);
  }, []);

  const login = (token, adminData) => {
    if (token) sessionStorage.setItem('admin-token', token);
    if (adminData) sessionStorage.setItem('admin-user', JSON.stringify(adminData));
    setAdmin(adminData);
  };

  const logout = () => {
    sessionStorage.removeItem('admin-token');
    sessionStorage.removeItem('admin-user');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
