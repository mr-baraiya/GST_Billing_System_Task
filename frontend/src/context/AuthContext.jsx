import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('gst_token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('gst_token');
    if (savedToken && savedToken !== 'undefined' && savedToken !== 'null') {
      api.get('/auth/me')
        .then((res) => {
          setUser(res.data);
          setLoading(false);
        })
        .catch(() => {
          setToken('');
          setUser(null);
          localStorage.removeItem('gst_token');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const hasPermission = (permissionKey) => {
    if (!user) return false;
    if (user.role === 'Owner') return true;
    if (user.status && user.status !== 'active') return false;
    return Array.isArray(user.permissions) && user.permissions.includes(permissionKey);
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  };

  const verifyOtp = async (email, otp) => {
    const res = await api.post('/auth/verify-otp', { email, otp });
    if (res.data.token) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('gst_token', res.data.token);
    }
    return res.data;
  };

  const resendOtp = async (email) => {
    const res = await api.post('/auth/resend-otp', { email });
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    setToken(res.data.token);
    setUser(res.data.user);
    localStorage.setItem('gst_token', res.data.token);
    return res.data;
  };

  const forgotPassword = async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  };

  const resetPassword = async (token, password) => {
    const res = await api.post('/auth/reset-password', { token, password });
    return res.data;
  };

  const updateProfile = async (name, email, mobile, profile_picture) => {
    const res = await api.put('/auth/profile', { name, email, mobile, profile_picture });
    setUser(res.data.user);
    if (res.data.token) {
      setToken(res.data.token);
      localStorage.setItem('gst_token', res.data.token);
    }
    return res.data;
  };

  const changePassword = async (oldPassword, newPassword) => {
    const res = await api.put('/auth/change-password', { oldPassword, newPassword });
    return res.data;
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('gst_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        hasPermission,
        login,
        verifyOtp,
        resendOtp,
        register,
        forgotPassword,
        resetPassword,
        updateProfile,
        changePassword,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
