import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin-token');
    const user = localStorage.getItem('admin-user');
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
    if (token) localStorage.setItem('admin-token', token);
    if (adminData) localStorage.setItem('admin-user', JSON.stringify(adminData));
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem('admin-token');
    localStorage.removeItem('admin-user');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
