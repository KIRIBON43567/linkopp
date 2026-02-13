import React, { createContext, useState, useContext, ReactNode } from 'react';
import { UserProfile } from '../types';

interface UserContextType {
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
}

const defaultUser: UserProfile = {
  id: 'current-user',
  name: 'Alex Chen',
  role: '产品经理',
  company: 'Startup.io',
  avatar: 'https://picsum.photos/id/338/200/200',
  tags: ['SaaS', '产品策略', '增长黑客'], // Initial default tags
  progress: 10,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(defaultUser);

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
