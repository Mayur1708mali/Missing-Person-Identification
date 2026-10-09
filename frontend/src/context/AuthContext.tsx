import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import client from '../api/client';

interface User {
  id: number;
  email: string;
  name: string;
  avatar_url: string | null;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('access_token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await client.post('/auth/google', {
          token: tokenResponse.access_token,
        });
        const { access_token, user: userData } = response.data;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } catch (error) {
        console.error('Login failed:', error);
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
    },
  });

  const login = () => {
    googleLogin();
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
