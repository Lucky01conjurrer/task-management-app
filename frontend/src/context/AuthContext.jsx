import { createContext, useState, useEffect, useContext } from 'react';
import {
  login as loginApi,
  register as registerApi,
  updateUserProfile
} from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      setError(null);
      const data = await registerApi({ name, email, password });

      // Save user data and token
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);

      setUser(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const data = await loginApi({ email, password });

      // Save user data and token
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);

      setUser(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Remove user data and token
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const updatedUser = await updateUserProfile(userData);

      // Update user data in state and localStorage
      const newUserData = {
        ...user,
        name: updatedUser.name || user.name,
        email: updatedUser.email || user.email
      };

      localStorage.setItem('user', JSON.stringify(newUserData));
      setUser(newUserData);

      return updatedUser;
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
