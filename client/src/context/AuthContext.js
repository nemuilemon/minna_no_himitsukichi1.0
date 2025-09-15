// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // jwt-decodeをインポート

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('token');
    } catch (error) {
      console.error('Failed to read token from localStorage:', error);
      return null;
    }
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;

        if (decoded.exp < now) {
          console.error("Token expired");
          setToken(null);
          setUser(null);
          try {
            localStorage.removeItem('token');
          } catch (storageError) {
            console.error('Failed to remove token from localStorage:', storageError);
          }
          return;
        }

        setUser({ id: decoded.userId });
        try {
          localStorage.setItem('token', token);
        } catch (storageError) {
          console.error('Failed to save token to localStorage:', storageError);
        }
      } catch (error) {
        console.error("Invalid token:", error);
        setToken(null);
        setUser(null);
        try {
          localStorage.removeItem('token');
        } catch (storageError) {
          console.error('Failed to remove token from localStorage:', storageError);
        }
      }
    } else {
      setUser(null);
      try {
        localStorage.removeItem('token');
      } catch (storageError) {
        console.error('Failed to remove token from localStorage:', storageError);
      }
    }
  }, [token]);

  const login = (newToken) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
  };

  const isLoggedIn = !!token;

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
