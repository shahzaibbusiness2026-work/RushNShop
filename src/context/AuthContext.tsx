'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, UserRole, SubscriptionTier, SaaSMetrics, SubscriptionPlan } from '@/types';
import { apiClient } from '@/lib/api';

const DEFAULT_USERS_FALLBACK: UserAccount[] = [
  {
    id: 'user-admin',
    organizationId: 'org-owner',
    name: 'Admin Owner',
    email: 'admin@rushnshop.com',
    password: 'admin123',
    role: 'owner',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    assignedStoreIds: ['*'],
    subscription: {
      tier: 'lifetime_owner',
      status: 'active',
      maxStores: 999,
      maxProducts: 99999,
    },
    isLocked: false,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-manager',
    organizationId: 'org-owner',
    name: 'TikTok Store Manager',
    email: 'manager@rushnshop.com',
    password: 'manager123',
    role: 'store_manager',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    assignedStoreIds: ['store-1'],
    subscription: {
      tier: 'pro',
      status: 'active',
      maxStores: 3,
      maxProducts: 250,
    },
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
  upgradeModalOpen: boolean;
  setUpgradeModalOpen: (open: boolean) => void;
  metrics: SaaSMetrics | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (payload: { name: string; email: string; password: string; role?: UserRole; assignedStoreIds?: string[] }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUser: (userId: string) => void;
  addUser: (payload: Partial<UserAccount>) => Promise<UserAccount>;
  deleteUser: (userId: string) => Promise<boolean>;
  toggleLockUser: (userId: string, isLocked: boolean) => Promise<boolean>;
  upgradePlan: (tier: SubscriptionTier, billingInterval?: 'monthly' | 'annual') => Promise<boolean>;
  refreshMetrics: () => Promise<void>;
  // Permissions & SaaS plan helpers
  isOwner: boolean;
  isAdmin: boolean;
  canManageUsers: boolean;
  canManageAllStores: boolean;
  canDeleteStore: boolean;
  canAccessStore: (storeId: string) => boolean;
  canAddStore: (currentStoreCount: number) => boolean;
  currentPlanTier: SubscriptionTier;
  planMaxStores: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<UserAccount[]>(DEFAULT_USERS_FALLBACK);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(DEFAULT_USERS_FALLBACK[0]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<SaaSMetrics | null>(null);

  // Load active session and users from backend / localStorage
  const loadAuth = async () => {
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

      // Fetch SaaS metrics if available
      try {
        const billingData = await apiClient.getBillingInfo();
        if (billingData?.metrics) {
          setMetrics(billingData.metrics);
        }
      } catch {}
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
  };

  useEffect(() => {
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
    setAuthModalOpen(true);
  };

  const switchUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      if (target.isLocked) {
        alert('This user profile is currently locked.');
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
        const filtered = prev.filter(u => u.id !== created.id);
        return [...filtered, created];
      });
      return created;
    } catch (err) {
      const fallbackUser: UserAccount = {
        id: `user-${Date.now()}`,
        organizationId: currentUser?.organizationId || `org-${Date.now()}`,
        name: payload.name || 'New Member',
        email: payload.email || 'member@example.com',
        role: payload.role || 'store_manager',
        avatar: payload.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(payload.name || 'User')}`,
        assignedStoreIds: payload.assignedStoreIds || ['*'],
        subscription: {
          tier: 'starter',
          status: 'active',
          maxStores: 1,
          maxProducts: 50,
        },
        isLocked: false,
        createdAt: new Date().toISOString(),
      };
      setUsers(prev => [...prev, fallbackUser]);
      return fallbackUser;
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
    } catch (err) {
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

  const upgradePlan = async (tier: SubscriptionTier, billingInterval: 'monthly' | 'annual' = 'monthly'): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await apiClient.upgradeSubscription(currentUser.id, tier, billingInterval);
      if (res?.user) {
        setCurrentUser(res.user);
        setUsers(prev => prev.map(u => u.id === res.user.id ? res.user : u));
        if (res.metrics) setMetrics(res.metrics);
        return true;
      }
      return false;
    } catch (err) {
      console.warn('[AuthContext] Local upgrade fallback:', err);
      const maxStoresMap: Record<SubscriptionTier, number> = {
        trial: 1,
        starter: 1,
        pro: 3,
        agency: 10,
        lifetime_owner: 999,
      };
      const updatedUser: UserAccount = {
        ...currentUser,
        subscription: {
          tier,
          status: 'active',
          maxStores: maxStoresMap[tier] || 1,
          maxProducts: tier === 'agency' ? 9999 : tier === 'pro' ? 250 : 50,
          billingInterval,
        },
      };
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      return true;
    }
  };

  const refreshMetrics = async () => {
    try {
      const billingData = await apiClient.getBillingInfo();
      if (billingData?.metrics) {
        setMetrics(billingData.metrics);
      }
    } catch {}
  };

  // Permission & Subscription helpers
  const isOwner = currentUser?.role === 'owner';
  const isAdmin = currentUser?.role === 'admin' || isOwner;
  const canManageUsers = isOwner || isAdmin;
  const canManageAllStores = isOwner || isAdmin || (currentUser?.assignedStoreIds?.includes('*') ?? false);
  const canDeleteStore = isOwner || isAdmin;

  const currentPlanTier: SubscriptionTier = isOwner 
    ? 'lifetime_owner' 
    : (currentUser?.subscription?.tier || 'starter');

  const planMaxStores: number = isOwner 
    ? 999 
    : (currentUser?.subscription?.maxStores || (currentPlanTier === 'agency' ? 10 : currentPlanTier === 'pro' ? 3 : 1));

  const canAddStore = (currentStoreCount: number): boolean => {
    if (isOwner) return true;
    return currentStoreCount < planMaxStores;
  };

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
        upgradeModalOpen,
        setUpgradeModalOpen,
        metrics,
        login,
        register,
        logout,
        switchUser,
        addUser,
        deleteUser,
        toggleLockUser,
        upgradePlan,
        refreshMetrics,
        isOwner,
        isAdmin,
        canManageUsers,
        canManageAllStores,
        canDeleteStore,
        canAccessStore,
        canAddStore,
        currentPlanTier,
        planMaxStores,
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
