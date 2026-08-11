import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiRequest, getToken, setToken } from '../api/client';

type User = {
  userId: string;
  role: string;
  email: string;
  name: string;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    apiRequest<{ data: { user: User } }>('/auth/me')
      .then((response) => setUser(response.data.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const response = await apiRequest<{ data: { token: string; user: User } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setToken(response.data.token);
    setUser(response.data.user);
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}