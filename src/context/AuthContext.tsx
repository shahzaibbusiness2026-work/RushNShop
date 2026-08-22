'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, UserRole } from '@/types';
import { apiClient } from '@/lib/api';

const DEFAULT_USERS_FALLBACK: UserAccount[] = [
  {
    id: 'user-admin',
    name: 'Admin Owner',
    email: 'admin@rushnshop.com',
    password: 'admin123',
    role: 'owner',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    assignedStoreIds: ['*'],
    isLocked: false,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-manager',
    name: 'TikTok Store Manager',
    email: 'manager@rushnshop.com',
    password: 'manager123',
    role: 'store_manager',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    assignedStoreIds: ['store-1'],
    isLocked: false,
    createdAt: '2026-01-01T00:00:00Z',
  },
];

interface AuthContextType {
  currentUser: UserAccount | null;
  users: UserAccount[];
  isLoading: boolean;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (payload: { name: string; email: string; password: string; role?: UserRole; assignedStoreIds?: string[] }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUser: (userId: string) => void;
  addUser: (payload: Partial<UserAccount>) => Promise<UserAccount>;
  deleteUser: (userId: string) => Promise<boolean>;
  toggleLockUser: (userId: string, isLocked: boolean) => Promise<boolean>;
  // Permissions
  isOwner: boolean;
  isAdmin: boolean;
  canManageUsers: boolean;
  canManageAllStores: boolean;
  canDeleteStore: boolean;
  canAccessStore: (storeId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<UserAccount[]>(DEFAULT_USERS_FALLBACK);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(DEFAULT_USERS_FALLBACK[0]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // Load active session and users from backend / localStorage
  useEffect(() => {
    async function loadAuth() {
      try {
        const fetchedUsers = await apiClient.getUsers();
        if (Array.isArray(fetchedUsers) && fetchedUsers.length > 0) {
          setUsers(fetchedUsers);
          
          const savedUserId = localStorage.getItem('rushnshop_active_user_id');
          if (savedUserId) {
            const matched = fetchedUsers.find(u => u.id === savedUserId);
            if (matched && !matched.isLocked) {
              setCurrentUser(matched);
            } else {
              setCurrentUser(fetchedUsers[0]);
            }
          } else {
            setCurrentUser(fetchedUsers[0]);
          }
        }
      } catch (err) {
        console.warn('[AuthContext] Backend unavailable, using local session state');
        const savedUsers = localStorage.getItem('rushnshop_users');
        if (savedUsers) {
          try {
            const parsed = JSON.parse(savedUsers);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setUsers(parsed);
              setCurrentUser(parsed[0]);
            }
          } catch {}
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const user = await apiClient.login(email, password);
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('rushnshop_active_user_id', user.id);
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (err: any) {
      // Local fallback
      const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (found) {
        if (found.isLocked) {
          return { success: false, error: 'This profile is locked by the admin' };
        }
        if (found.password && found.password !== password) {
          return { success: false, error: 'Invalid password' };
        }
        setCurrentUser(found);
        localStorage.setItem('rushnshop_active_user_id', found.id);
        return { success: true };
      }
      return { success: false, error: err.message || 'Invalid email or password' };
    }
  };

  const register = async (payload: { name: string; email: string; password: string; role?: UserRole; assignedStoreIds?: string[] }): Promise<{ success: boolean; error?: string }> => {
    try {
      const user = await apiClient.register(payload);
      setUsers(prev => [...prev, user]);
      setCurrentUser(user);
      localStorage.setItem('rushnshop_active_user_id', user.id);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('rushnshop_active_user_id');
    // Switch to first viewer/login prompt or stay as null
    setAuthModalOpen(true);
  };

  const switchUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      if (target.isLocked) {
        alert('This user profile is locked.');
        return;
      }
      setCurrentUser(target);
      localStorage.setItem('rushnshop_active_user_id', target.id);
    }
  };

  const addUser = async (payload: Partial<UserAccount>): Promise<UserAccount> => {
    try {
      const created = await apiClient.saveUser(payload);
      setUsers(prev => {
        const existing = prev.findIndex(u => u.id === created.id);
        if (existing >= 0) {
          const next = [...prev];
          next[existing] = created;
          return next;
        }
        return [...prev, created];
      });
      return created;
    } catch (err: any) {
      // Local fallback
      const localUser: UserAccount = {
        id: `user-${Date.now()}`,
        name: payload.name || 'Team Member',
        email: (payload.email || '').toLowerCase().trim(),
        password: payload.password || 'password123',
        role: payload.role || 'store_manager',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(payload.name || 'User')}`,
        assignedStoreIds: payload.assignedStoreIds || ['*'],
        isLocked: Boolean(payload.isLocked),
        createdAt: new Date().toISOString(),
      };
      setUsers(prev => [...prev, localUser]);
      return localUser;
    }
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    if (currentUser?.id === userId) {
      throw new Error('You cannot delete your own logged-in account.');
    }
    try {
      await apiClient.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      return true;
    } catch (err: any) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      return true;
    }
  };

  const toggleLockUser = async (userId: string, isLocked: boolean): Promise<boolean> => {
    try {
      await apiClient.toggleUserLock(userId, isLocked);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isLocked } : u));
      return true;
    } catch (err) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isLocked } : u));
      return true;
    }
  };

  // Permission helpers
  const isOwner = currentUser?.role === 'owner';
  const isAdmin = currentUser?.role === 'admin' || isOwner;
  const canManageUsers = isOwner || isAdmin;
  const canManageAllStores = isOwner || isAdmin || (currentUser?.assignedStoreIds?.includes('*') ?? false);
  const canDeleteStore = isOwner || isAdmin;

  const canAccessStore = (storeId: string): boolean => {
    if (!currentUser) return false;
    if (isOwner || isAdmin) return true;
    if (currentUser.assignedStoreIds?.includes('*')) return true;
    return currentUser.assignedStoreIds?.includes(storeId) ?? false;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        isLoading,
        authModalOpen,
        setAuthModalOpen,
        login,
        register,
        logout,
        switchUser,
        addUser,
        deleteUser,
        toggleLockUser,
        isOwner,
        isAdmin,
        canManageUsers,
        canManageAllStores,
        canDeleteStore,
        canAccessStore,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
