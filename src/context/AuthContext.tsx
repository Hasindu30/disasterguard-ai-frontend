import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create pre-configured axios instance
export const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: 'USER' | 'ADMIN') => Promise<void>;
  logout: () => void;
  setErrorMsg: (msg: string | null) => void;
  errorMsg: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load token and fetch user on initial mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          setToken(storedToken);
          // Set authorization header globally for this axios instance
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error('Failed to restore auth session:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: receivedToken, ...userData } = response.data;
      
      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
      setUser(userData);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Login failed. Please check credentials.';
      setErrorMsg(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role?: 'USER' | 'ADMIN') => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      const { token: receivedToken, ...userData } = response.data;
      
      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
      setUser(userData);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Registration failed.';
      setErrorMsg(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
    setErrorMsg(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        errorMsg,
        setErrorMsg,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
