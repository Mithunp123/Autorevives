import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authService } from '@/services';
import { storage, ROLES } from '@/utils';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => storage.getUser());
  const [token, setToken] = useState(() => storage.getToken());
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const isAuthenticated = !!token && !!user;

  // Mark as initialized once we've read from storage
  useEffect(() => {
    setInitialized(true);
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const { data } = await authService.login(credentials);
      storage.setToken(data.token);
      storage.setUser(data.user);
      setToken(data.token);
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.username}!`);
      return data.user;
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.message || 'Login failed';
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data) => {
    setLoading(true);
    try {
      const res = await authService.register(data);
      toast.success(res.data.message || 'Registration successful!');
      return res.data;
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout API errors
    } finally {
      storage.clear();
      setToken(null);
      setUser(null);
      toast.success('Logged out successfully');
    }
  }, []);

  const updateUser = useCallback((userData) => {
    const updated = { ...user, ...userData };
    storage.setUser(updated);
    setUser(updated);
  }, [user]);

  const hasRole = useCallback(
    (role) => {
      if (!user) return false;
      if (Array.isArray(role)) return role.includes(user.role);
      return user.role === role;
    },
    [user]
  );

  const isAdmin = user?.role === ROLES.ADMIN;
  const isOffice = user?.role === ROLES.OFFICE;
  const isUser = user?.role === ROLES.USER;

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'autorevive_token') {
        if (!e.newValue) {
          setToken(null);
          setUser(null);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        loading,
        initialized,
        isAuthenticated,
        isAdmin,
        isOffice,
        isUser,
        login,
        register,
        logout,
        updateUser,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
