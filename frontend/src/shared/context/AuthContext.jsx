import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';

const AuthContext = createContext(null);

// Create a custom hook for safe navigation
export const useSafeNavigate = () => {
  try {
    return useNavigate();
  } catch (error) {
    // Return a no-op function if useNavigate fails (outside Router)
    return () => console.warn('Navigation not available outside Router');
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useSafeNavigate();

  // Function to get the full URL for media files
  const getFullMediaUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${import.meta.env.VITE_API_BASE_URL || ''}${url}`;
  };

  // Process user data to ensure profile picture has full URL
  const processUserData = (userData) => {
    if (!userData) return null;
    
    return {
      ...userData,
      profile_picture: userData.profile_picture ? getFullMediaUrl(userData.profile_picture) : null
    };
  };

  // Function to check if user is authenticated
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      if (!accessToken) {
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }
      
      setToken(accessToken);
      const data = await authApi.verifyToken();
      setUser(processUserData(data.user));
    } catch (err) {
      console.error('Auth check failed:', err);
      setUser(null);
      setToken(null);
      setError(err.message);
      // Clear tokens on auth error
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
    } finally {
    setLoading(false);
    }
  }, []);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const data = await authApi.login(credentials);

      // Set token from response or storage
      const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      setToken(accessToken);
      
      setUser(processUserData(data.user));
      return data;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const data = await authApi.register(userData);
      
      // Set token from response or storage
      const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      setToken(accessToken);
      
      setUser(processUserData(data.user));
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await authApi.logout();
      setUser(null);
      setToken(null);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      const data = await authApi.updateProfile(profileData);
      console.log('Raw data from API in updateProfile:', data);
      
      // Process the user data to ensure profile picture URLs are correct
      const updatedUser = processUserData(data);
      console.log('Processed user data in updateProfile:', updatedUser);
      
      // Update the user state with the new data
      setUser(prevUser => ({
        ...prevUser,
        ...updatedUser
      }));
      
      return updatedUser;
    } catch (err) {
      console.error('Profile update error in context:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Change password function
  const changePassword = async (passwordData) => {
    try {
      setLoading(true);
      setError(null);
      return await authApi.changePassword(passwordData);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Request password reset function
  const requestPasswordReset = async (email) => {
    try {
      setLoading(true);
      setError(null);
      return await authApi.requestPasswordReset(email);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete account function
  const deleteAccount = async (password) => {
    try {
      setLoading(true);
      setError(null);
      await authApi.deleteAccount(password);
      setUser(null);
      setToken(null);
      navigate('/login');
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      loading,
      error,
      login, 
      register,
      logout, 
      updateProfile,
      changePassword,
      requestPasswordReset,
      deleteAccount,
      checkAuth,
      isAuthenticated: !!user && !!token,
      isTeacher: user?.user_type === 'teacher',
      isStudent: user?.user_type === 'student'
    }}>
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
