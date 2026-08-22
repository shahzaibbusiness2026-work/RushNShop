'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  ProductItem, 
  StoreSettings, 
  ListingItem, 
  CalculationResult, 
  StoreInfo, 
  OrderEconomics, 
  MonthlyDataPoint 
} from '@/types';
import { INITIAL_STORES } from '@/lib/defaultData';
import { DEFAULT_SETTINGS, calculateProductProfit } from '@/lib/calculations';
import { apiClient } from '@/lib/api';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

export interface NewStorePayload {
  name: string;
  handle?: string;
  region: 'US' | 'UK' | 'EU' | 'CA' | 'AU' | 'GLOBAL';
  currency?: string;
  currencySymbol?: string;
  tiktokCommissionPercent?: number;
  withDemoData?: boolean;
}

interface StoreContextType {
  stores: StoreInfo[];
  activeStoreId: string;
  activeStore: string;
  activeStoreInfo: StoreInfo;
  products: ProductItem[];
  settings: StoreSettings;
  listings: ListingItem[];
  orders: OrderEconomics[];
  monthlyData: MonthlyDataPoint[];
  currentCalculator: Partial<ProductItem>;
  currentCalculation: CalculationResult;
  comparisonProductIds: string[];
  dateRange: string;
  setDateRange: (range: string) => void;
  aiDrawerOpen: boolean;
  setAiDrawerOpen: (open: boolean) => void;
  commandMenuOpen: boolean;
  setCommandMenuOpen: (open: boolean) => void;
  toasts: ToastMessage[];
  activeToasts: ToastMessage[];
  unreadNotificationCount: number;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;

  // Store Management
  setActiveStore: (nameOrId: string) => void;
  addStore: (payload: NewStorePayload) => Promise<StoreInfo>;
  deleteStore: (storeId: string) => Promise<void>;

  // Actions
  saveProduct: (product: Partial<ProductItem>) => Promise<ProductItem>;
  bulkAddProducts: (products: Partial<ProductItem>[]) => Promise<ProductItem[]>;
  deleteProduct: (id: string) => Promise<void>;
  duplicateProduct: (id: string) => Promise<ProductItem | null>;
  updateCalculator: (updates: Partial<ProductItem>) => void;
  resetCalculator: () => void;
  loadProductIntoCalculator: (id: string) => void;
  toggleCompareProduct: (id: string) => void;
  setComparisonProductIds: (ids: string[]) => void;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
  resetSettings: () => void;
  createListingFromProduct: (prod: Partial<ProductItem>) => Promise<ListingItem>;
  updateListing: (id: string, updates: Partial<ListingItem>) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  showToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  markNotificationsRead: () => void;
  dismissToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_THEME = 'rushnshop_theme_v1';
const LOCAL_STORAGE_KEY_ACTIVE_STORE_ID = 'rushnshop_active_store_id_v2';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');

  // Multi-store state
  const [stores, setStores] = useState<StoreInfo[]>(INITIAL_STORES);
  const [activeStoreId, setActiveStoreId] = useState<string>(INITIAL_STORES[0].id);

  // Active store's operational data
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_STORES[0].products);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_STORES[0].settings);
  const [listings, setListings] = useState<ListingItem[]>(INITIAL_STORES[0].listings);
  const [orders, setOrders] = useState<OrderEconomics[]>(INITIAL_STORES[0].orders);
  const [monthlyData, setMonthlyData] = useState<MonthlyDataPoint[]>(INITIAL_STORES[0].monthlyData);

  const [comparisonProductIds, setComparisonProductIdsState] = useState<string[]>([
    'prod-1', 'prod-2', 'prod-3'
  ]);

  const [dateRange, setDateRange] = useState('Last 30 Days (Month)');
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);
  
  const [activeToasts, setActiveToasts] = useState<ToastMessage[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([
    {
      id: 'n-1',
      title: 'Backend Connected',
      message: 'Server REST APIs and persistent database initialized.',
      type: 'info',
      timestamp: 'Just now',
      read: false,
    }
  ]);

  // Current active product in the calculator
  const [currentCalculator, setCurrentCalculator] = useState<Partial<ProductItem>>({
    name: 'Wireless Charger 15W',
    sku: 'WC-001',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=300&auto=format&fit=crop&q=80',
    costPrice: 9.00,
    shippingCost: 2.00,
    packagingCost: 1.00,
    otherProductCost: 0.00,
    tiktokCommissionPercent: 10.00,
    transactionFeePercent: 2.00,
    affiliatePercent: 5.00,
    tiktokAdsCost: 3.50,
    creatorCost: 0.00,
    otherMarketingCost: 0.00,
    customExpenses: 0.00,
    sellingPrice: 29.99,
  });

  const activeStoreInfo = stores.find(s => s.id === activeStoreId) || stores[0] || INITIAL_STORES[0];
  const activeStore = activeStoreInfo.name;

  // Load from backend server API on mount
  useEffect(() => {
    setIsMounted(true);
    
    // Theme preference
    try {
      const storedTheme = localStorage.getItem(LOCAL_STORAGE_KEY_THEME) as 'light' | 'dark' | null;
      if (storedTheme) {
        setThemeState(storedTheme);
        document.documentElement.classList.toggle('dark', storedTheme === 'dark');
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setThemeState('dark');
        document.documentElement.classList.add('dark');
      }
    } catch (e) {}

    // Fetch stores from backend server
    async function initFromBackend() {
      try {
        const { stores: serverStores, activeStoreId: serverActiveId } = await apiClient.getStores();
        if (serverStores && serverStores.length > 0) {
          setStores(serverStores);
          
          const preferredId = localStorage.getItem(LOCAL_STORAGE_KEY_ACTIVE_STORE_ID) || serverActiveId;
          const target = serverStores.find(s => s.id === preferredId) || serverStores[0];
          
          setActiveStoreId(target.id);
          setProducts(target.products || []);
          setSettings(target.settings);
          setListings(target.listings || []);
          setOrders(target.orders || []);
          setMonthlyData(target.monthlyData || []);

          if (target.products && target.products.length > 0) {
            setCurrentCalculator(target.products[0]);
            setComparisonProductIdsState(target.products.slice(0, 4).map(p => p.id));
          }
        }
      } catch (err) {
        console.warn('Using local fallback state during initial load:', err);
      }
    }

    initFromBackend();
  }, []);

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_THEME, newTheme);
    } catch (e) {}
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    showToast(`Switched to ${next === 'dark' ? 'Dark' : 'Bright'} Theme`, `Theme preference updated.`, 'info');
  };

  // Switch Active Store
  const setActiveStore = (nameOrId: string) => {
    const target = stores.find(s => s.id === nameOrId || s.name.toLowerCase() === nameOrId.toLowerCase());
    if (!target) return;

    setActiveStoreId(target.id);
    setProducts(target.products || []);
    setSettings(target.settings);
    setListings(target.listings || []);
    setOrders(target.orders || []);
    setMonthlyData(target.monthlyData || []);

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_ACTIVE_STORE_ID, target.id);
    } catch (e) {}

    if (target.products && target.products.length > 0) {
      setCurrentCalculator(target.products[0]);
      setComparisonProductIdsState(target.products.slice(0, 4).map(p => p.id));
    } else {
      resetCalculator();
      setComparisonProductIdsState([]);
    }

    showToast('Store Switched', `Switched to "${target.name}" (${target.currencySymbol} ${target.currency})`, 'info');
  };

  // Add a new Store (calls server backend)
  const addStore = async (payload: NewStorePayload): Promise<StoreInfo> => {
    try {
      const newStore = await apiClient.createStore(payload);
      setStores(prev => [...prev, newStore]);
      setActiveStoreId(newStore.id);
      setProducts(newStore.products || []);
      setSettings(newStore.settings);
      setListings(newStore.listings || []);
      setOrders(newStore.orders || []);
      setMonthlyData(newStore.monthlyData || []);

      if (newStore.products && newStore.products.length > 0) {
        setCurrentCalculator(newStore.products[0]);
        setComparisonProductIdsState(newStore.products.map(p => p.id));
      } else {
        resetCalculator();
        setComparisonProductIdsState([]);
      }

      showToast('Store Created', `Created and saved "${payload.name}" to server database.`, 'success');
      return newStore;
    } catch (error) {
      showToast('Creation Failed', 'Failed saving store to backend.', 'error');
      throw error;
    }
  };

  // Delete Store (calls server backend)
  const deleteStore = async (storeId: string): Promise<void> => {
    if (stores.length <= 1) {
      showToast('Action Prohibited', 'Cannot delete your only remaining store.', 'warning');
      return;
    }

    try {
      await apiClient.deleteStore(storeId);
      const nextStores = stores.filter(s => s.id !== storeId);
      setStores(nextStores);

      if (activeStoreId === storeId) {
        const fallback = nextStores[0];
        setActiveStoreId(fallback.id);
        setProducts(fallback.products || []);
        setSettings(fallback.settings);
        setListings(fallback.listings || []);
        setOrders(fallback.orders || []);
        setMonthlyData(fallback.monthlyData || []);
      }

      showToast('Store Removed', 'Store removed from database.', 'info');
    } catch (error) {
      showToast('Error', 'Failed deleting store.', 'error');
    }
  };

  // Dynamic live calculation for currentCalculator
  const currentCalculation = calculateProductProfit(currentCalculator, settings);

  const showToast = (title: string, message: string, type: ToastMessage['type'] = 'info') => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      message,
      type,
      timestamp: 'Just now',
      read: false,
    };
    setToasts(prev => [newToast, ...prev]);
    setActiveToasts(prev => [newToast, ...prev.filter(t => t.id !== newToast.id).slice(0, 3)]);
  };

  const markNotificationsRead = () => {
    setToasts(prev => prev.map(t => ({ ...t, read: true })));
  };

  const dismissToast = (id: string) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
  };

  const unreadNotificationCount = toasts.filter(t => !t.read).length;

  const updateCalculator = (updates: Partial<ProductItem>) => {
    setCurrentCalculator(prev => ({
      ...prev,
      ...updates,
    }));
  };

  const resetCalculator = () => {
    setCurrentCalculator({
      name: '',
      sku: `SKU-${Math.floor(100 + Math.random() * 900)}`,
      category: 'General',
      image: '',
      costPrice: 0,
      shippingCost: settings.defaultShippingCost,
      packagingCost: settings.defaultPackagingCost,
      otherProductCost: 0,
      tiktokCommissionPercent: settings.tiktokCommissionPercent,
      transactionFeePercent: settings.transactionFeePercent,
      affiliatePercent: settings.defaultAffiliatePercent,
      tiktokAdsCost: 0,
      creatorCost: 0,
      otherMarketingCost: 0,
      customExpenses: 0,
      sellingPrice: 0,
    });
    showToast('Calculator Reset', 'Initialized clean calculator with store default fees.', 'info');
  };

  const calculateProductEconomics = (p: Partial<ProductItem>): ProductItem => {
    const name = p.name || 'Untitled Product';
    const sku = p.sku || `SKU-${Date.now().toString().slice(-4)}`;
    const category = p.category || 'General';
    const image = p.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80';
    const costPrice = Number(p.costPrice) || 0;
    const shippingCost = Number(p.shippingCost) || 0;
    const shippingCharge = Number(p.shippingCharge ?? settings.defaultShippingCharge ?? 0) || 0;
    const packagingCost = Number(p.packagingCost) || 0;
    const otherProductCost = Number(p.otherProductCost) || 0;
    const sellingPrice = Number(p.sellingPrice) || 0;
    const tiktokCommissionPercent = Number(p.tiktokCommissionPercent ?? settings.tiktokCommissionPercent);
    const transactionFeePercent = Number(p.transactionFeePercent ?? settings.transactionFeePercent);
    const affiliatePercent = Number(p.affiliatePercent ?? settings.defaultAffiliatePercent);
    const tiktokAdsCost = Number(p.tiktokAdsCost) || 0;
    const creatorCost = Number(p.creatorCost) || 0;
    const otherMarketingCost = Number(p.otherMarketingCost) || 0;
    const customExpenses = Number(p.customExpenses) || 0;

    const grossRevenue = sellingPrice + shippingCharge;
    const totalProductCost = costPrice + shippingCost + packagingCost + otherProductCost;
    const totalFeesPercent = tiktokCommissionPercent + transactionFeePercent;
    const totalFeeAmount = ((grossRevenue * totalFeesPercent) + (sellingPrice * affiliatePercent)) / 100;
    const totalMarketingCost = tiktokAdsCost + creatorCost + otherMarketingCost;
    const totalAllCost = totalProductCost + totalFeeAmount + totalMarketingCost + customExpenses;
    const netProfit = grossRevenue - totalAllCost;
    const profitMarginPercent = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

    let status: 'excellent' | 'good' | 'low' | 'loss' = 'good';
    if (netProfit < 0) status = 'loss';
    else if (profitMarginPercent >= 35) status = 'excellent';
    else if (profitMarginPercent >= 20) status = 'good';
    else status = 'low';

    return {
      id: p.id || `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      sku,
      category,
      image,
      costPrice,
      shippingCost,
      shippingCharge,
      packagingCost,
      otherProductCost,
      tiktokCommissionPercent,
      transactionFeePercent,
      affiliatePercent,
      tiktokAdsCost,
      creatorCost,
      otherMarketingCost,
      customExpenses,
      sellingPrice,
      status,
      createdAt: p.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      inComparison: p.inComparison ?? false,
    };
  };

  // Save product to backend with client-side fallback
  const saveProduct = async (productData: Partial<ProductItem>): Promise<ProductItem> => {
    let saved: ProductItem;
    try {
      saved = await apiClient.saveProduct(activeStoreId, productData);
    } catch (error) {
      console.warn('[RushNshop Context] API save fallback to client state:', error);
      saved = calculateProductEconomics(productData);
    }
    
    setProducts(prev => {
      const existingIdx = prev.findIndex(p => p.id === saved.id);
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = saved;
        return next;
      }
      return [saved, ...prev];
    });

    // Update in stores list
    setStores(prev => prev.map(s => {
      if (s.id === activeStoreId) {
        const existingIdx = s.products.findIndex(p => p.id === saved.id);
        const nextProds = [...s.products];
        if (existingIdx >= 0) nextProds[existingIdx] = saved;
        else nextProds.unshift(saved);
        return { ...s, products: nextProds };
      }
      return s;
    }));

    showToast('Calculation Saved', `Saved "${saved.name}" to catalog.`, 'success');
    return saved;
  };

  // Bulk add products with client-side fallback
  const bulkAddProducts = async (productsData: Partial<ProductItem>[]): Promise<ProductItem[]> => {
    if (!productsData || productsData.length === 0) return [];
    
    let savedList: ProductItem[];
    try {
      savedList = await apiClient.bulkSaveProducts(activeStoreId, productsData);
    } catch (error) {
      console.warn('[RushNshop Context] API bulk save fallback to client state:', error);
      savedList = productsData.map(p => calculateProductEconomics(p));
    }

    setProducts(prev => [...savedList, ...prev]);

    setStores(prev => prev.map(s => {
      if (s.id === activeStoreId) {
        return { ...s, products: [...savedList, ...s.products] };
      }
      return s;
    }));

    showToast('Bulk Import Complete', `Successfully imported ${savedList.length} products to active store.`, 'success');
    return savedList;
  };

  // Delete product from backend
  const deleteProduct = async (id: string): Promise<void> => {
    const item = products.find(p => p.id === id);
    try {
      await apiClient.deleteProduct(activeStoreId, id);
    } catch (error) {
      console.warn('[RushNshop Context] API delete fallback to client state:', error);
    }

    setProducts(prev => prev.filter(p => p.id !== id));
    setComparisonProductIdsState(prev => prev.filter(pid => pid !== id));
    
    setStores(prev => prev.map(s => {
      if (s.id === activeStoreId) {
        return { ...s, products: s.products.filter(p => p.id !== id) };
      }
      return s;
    }));

    showToast('Product Deleted', `Removed "${item?.name || 'product'}" from database.`, 'info');
  };

  const duplicateProduct = async (id: string): Promise<ProductItem | null> => {
    const source = products.find(p => p.id === id);
    if (!source) return null;

    const cloned: Partial<ProductItem> = {
      ...source,
      id: undefined,
      name: `${source.name} (Copy)`,
      sku: `${source.sku}-COPY`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      inComparison: false,
    };

    const saved = await saveProduct(cloned);
    setCurrentCalculator(saved);
    showToast('Calculation Duplicated', `Created duplicate "${saved.name}".`, 'success');
    return saved;
  };

  const loadProductIntoCalculator = (id: string) => {
    const target = products.find(p => p.id === id);
    if (target) {
      setCurrentCalculator({ ...target });
      showToast('Product Loaded', `Loaded "${target.name}" into profit calculator.`, 'info');
    }
  };

  const toggleCompareProduct = (id: string) => {
    setComparisonProductIdsState(prev => {
      if (prev.includes(id)) {
        showToast('Removed from Comparison', 'Product removed from side-by-side view.', 'info');
        return prev.filter(item => item !== id);
      } else {
        if (prev.length >= 4) {
          showToast('Comparison Full', 'You can compare up to 4 products at once.', 'warning');
          return prev;
        }
        showToast('Added to Comparison', 'Product added to side-by-side comparison.', 'success');
        return [...prev, id];
      }
    });
  };

  const setComparisonProductIds = (ids: string[]) => {
    setComparisonProductIdsState(ids.slice(0, 4));
  };

  const updateSettings = async (newSettings: Partial<StoreSettings>): Promise<void> => {
    try {
      const updated = await apiClient.updateSettings(activeStoreId, newSettings);
      setSettings(updated);
      
      setStores(prev => prev.map(s => {
        if (s.id === activeStoreId) {
          return { ...s, settings: updated };
        }
        return s;
      }));

      showToast('Settings Saved', 'Business rules and fee rates saved to server.', 'success');
    } catch (error) {
      showToast('Error', 'Failed saving settings to server.', 'error');
    }
  };

  const resetSettings = () => {
    updateSettings(DEFAULT_SETTINGS);
    showToast('Settings Reset', 'Restored global default configuration.', 'info');
  };

  const createListingFromProduct = async (prod: Partial<ProductItem>): Promise<ListingItem> => {
    const calc = calculateProductProfit(prod, settings);
    const newListing: ListingItem = {
      id: `list-${Date.now()}`,
      productId: prod.id || `prod-${Date.now()}`,
      productName: prod.name || 'New TikTok Shop Listing',
      sku: prod.sku || 'SKU-001',
      sellingPrice: Number(prod.sellingPrice) || 0,
      costPrice: Number(prod.costPrice) || 0,
      expectedProfit: calc.netProfit,
      expectedMargin: calc.profitMarginPercent,
      category: prod.category ? `${prod.category} > Best Sellers` : 'General > Trending Items',
      description: `Premium ${prod.name || 'product'} featuring high quality build and fast dispatch. Tested and verified for TikTok viral campaigns.`,
      keyFeatures: [
        'High quality durable materials',
        'TikTok viral design and packaging',
        'Fast local warehouse shipping',
        '30-day satisfaction guarantee'
      ],
      tags: [`#${(prod.name || 'product').toLowerCase().replace(/\s+/g, '')}`, '#tiktokshop', '#musthave', '#trending'],
      status: 'ready',
      createdAt: new Date().toISOString().split('T')[0],
    };

    try {
      const saved = await apiClient.saveListing(activeStoreId, newListing);
      setListings(prev => [saved, ...prev]);
      
      setStores(prev => prev.map(s => {
        if (s.id === activeStoreId) {
          return { ...s, listings: [saved, ...s.listings] };
        }
        return s;
      }));

      showToast('Listing Created', `Draft listing for "${saved.productName}" saved to server.`, 'success');
      return saved;
    } catch (error) {
      showToast('Error', 'Failed saving listing to server.', 'error');
      throw error;
    }
  };

  const updateListing = async (id: string, updates: Partial<ListingItem>): Promise<void> => {
    const current = listings.find(l => l.id === id);
    if (!current) return;
    const updated = { ...current, ...updates };

    try {
      const saved = await apiClient.saveListing(activeStoreId, updated);
      setListings(prev => prev.map(item => item.id === id ? saved : item));
      showToast('Listing Updated', 'Listing details updated on server.', 'success');
    } catch (error) {
      showToast('Error', 'Failed updating listing on server.', 'error');
    }
  };

  const deleteListing = async (id: string): Promise<void> => {
    try {
      await apiClient.deleteListing(activeStoreId, id);
      setListings(prev => prev.filter(item => item.id !== id));
      showToast('Listing Deleted', 'Listing removed from server.', 'info');
    } catch (error) {
      showToast('Error', 'Failed deleting listing on server.', 'error');
    }
  };

  return (
    <StoreContext.Provider
      value={{
        stores,
        activeStoreId,
        activeStore,
        activeStoreInfo,
        products,
        settings,
        listings,
        orders,
        monthlyData,
        currentCalculator,
        currentCalculation,
        comparisonProductIds,
        dateRange,
        setDateRange,
        aiDrawerOpen,
        setAiDrawerOpen,
        commandMenuOpen,
        setCommandMenuOpen,
        toasts,
        activeToasts,
        unreadNotificationCount,
        theme,
        toggleTheme,
        setTheme,
        setActiveStore,
        addStore,
        deleteStore,
        saveProduct,
        bulkAddProducts,
        deleteProduct,
        duplicateProduct,
        updateCalculator,
        resetCalculator,
        loadProductIntoCalculator,
        toggleCompareProduct,
        setComparisonProductIds,
        updateSettings,
        resetSettings,
        createListingFromProduct,
        updateListing,
        deleteListing,
        showToast,
        markNotificationsRead,
        dismissToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
