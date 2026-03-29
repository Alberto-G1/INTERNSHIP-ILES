import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import { notifySuccess } from '../components/Common/AppToast';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user on initial app load
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('access_token');
      
      if (token) {
        try {
          const response = await authAPI.getProfile();
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to load user:', error);
          // Clear invalid tokens
          localStorage.clear();
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authAPI.login({ username, password });
      const { access, refresh, user } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setUser(user);
      setIsAuthenticated(true);
      notifySuccess('Login successful!', { title: 'Welcome Back' });
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { access, refresh, user, approval_required, message } = response.data;

      if (access && refresh) {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        setUser(user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }

      notifySuccess(message || 'Registration successful!', { title: 'Account Created' });
      
      return { user, approval_required: Boolean(approval_required) };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Try to call logout endpoint if we have a refresh token
      await authAPI.logout();
    } catch (error) {
      // Even if the API call fails, we still want to clear local storage
      console.error('Logout API error:', error);
    } finally {
      // Always clear local storage and state
      localStorage.clear();
      setUser(null);
      setIsAuthenticated(false);
      notifySuccess('Logged out successfully', { title: 'Signed Out' });
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};