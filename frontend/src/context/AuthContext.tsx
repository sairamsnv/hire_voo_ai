import React, { createContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

interface User {
  id: number;
  email: string;
  full_name?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  setIsAuthenticated: (value: boolean) => void;
  setUser: (user: User | null) => void;
  checkSession: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  setIsAuthenticated: () => {},
  setUser: () => {},
  checkSession: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/session/', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': cookies.get('csrftoken') || '',
        },
      });

      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(data.isAuthenticated);
        setUser(data.user || null);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (err) {
      console.error('Session check failed:', err);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const res = await fetch('/api/logout/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': cookies.get('csrftoken') || '',
        },
      });

      if (res.ok) {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.clear();
        sessionStorage.clear();
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        setIsAuthenticated,
        setUser,
        checkSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

