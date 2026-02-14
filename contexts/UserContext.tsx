import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { UserProfile } from '../types';
import { authAPI, getAuthToken } from '../src/services/apiClient';

interface UserContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<UserProfile>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const result = await authAPI.getMe();
          setUser(convertAPIUserToProfile(result.user));
        } catch (error) {
          console.error('Auth check failed:', error);
          authAPI.logout();
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await authAPI.login({ email, password });
      setUser(convertAPIUserToProfile(result.user));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const result = await authAPI.register({ email, password, name });
      setUser(convertAPIUserToProfile(result.user));
    } catch (error) {
      console.error('Register failed:', error);
      throw error;
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  return (
    <UserContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      updateUser
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};

// Helper function to convert API user to UserProfile
function convertAPIUserToProfile(apiUser: any): UserProfile {
  return {
    id: apiUser.id,
    name: apiUser.name,
    role: apiUser.role || '用户',
    company: apiUser.company || '',
    avatar: apiUser.avatar || 'https://picsum.photos/200/200',
    tags: apiUser.skills ? JSON.parse(apiUser.skills) : [],
    progress: 10,
  };
}
