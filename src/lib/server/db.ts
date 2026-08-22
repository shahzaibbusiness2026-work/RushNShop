import fs from 'fs';
import path from 'path';
import { 
  StoreInfo, 
  ProductItem, 
  ListingItem, 
  OrderEconomics, 
  StoreSettings, 
  MonthlyDataPoint, 
  UserAccount,
  SubscriptionTier,
  SubscriptionPlan,
  SaaSMetrics
} from '@/types';
import { INITIAL_STORES } from '@/lib/defaultData';
import { DEFAULT_SETTINGS } from '@/lib/calculations';
import { SAAS_PLANS } from '@/lib/saasPlans';

export { SAAS_PLANS };

export const DEFAULT_USERS: UserAccount[] = [
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
    createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
  },
];

interface DatabaseSchema {
  stores: StoreInfo[];
  users: UserAccount[];
  activeStoreId: string;
  updatedAt: string;
}

let inMemoryCache: DatabaseSchema | null = null;

function getDbPaths(): { dir: string; file: string } {
  const isServerless = Boolean(
    process.env.VERCEL || 
    process.env.AWS_LAMBDA_FUNCTION_NAME || 
    process.env.NOW_REGION
  );

  if (isServerless) {
    const dir = path.join('/tmp', 'rushnshop_data');
    return { dir, file: path.join(dir, 'rushnshop_database.json') };
  }

  try {
    const dir = path.join(process.cwd(), 'data');
    return { dir, file: path.join(dir, 'rushnshop_database.json') };
  } catch {
    const dir = path.join('/tmp', 'rushnshop_data');
    return { dir, file: path.join(dir, 'rushnshop_database.json') };
  }
}

function ensureDbFile(): DatabaseSchema {
  if (inMemoryCache) {
    if (!Array.isArray(inMemoryCache.users)) {
      inMemoryCache.users = [...DEFAULT_USERS];
    }
    return inMemoryCache;
  }

  const { dir, file } = getDbPaths();

  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8');
      const parsed = JSON.parse(content) as DatabaseSchema;
      if (parsed && Array.isArray(parsed.stores) && parsed.stores.length > 0) {
        if (!Array.isArray(parsed.users) || parsed.users.length === 0) {
          parsed.users = [...DEFAULT_USERS];
        }
        inMemoryCache = parsed;
        return inMemoryCache;
      }
    }
  } catch (error) {
    console.warn('[RushNshop DB] Filesystem read error, using in-memory store:', error);
  }

  const initialData: DatabaseSchema = {
    stores: INITIAL_STORES,
    users: [...DEFAULT_USERS],
    activeStoreId: INITIAL_STORES[0].id,
    updatedAt: new Date().toISOString(),
  };

  try {
    const { dir, file } = getDbPaths();
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(file, JSON.stringify(initialData, null, 2), 'utf-8');
  } catch (writeErr) {
    console.warn('[RushNshop DB] Initial file write skipped (serverless readonly):', writeErr);
  }

  inMemoryCache = initialData;
  return inMemoryCache;
}

function writeDb(data: DatabaseSchema): void {
  data.updatedAt = new Date().toISOString();
  inMemoryCache = data;

  try {
    const { dir, file } = getDbPaths();
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.warn('[RushNshop DB] Write to disk skipped (serverless environment):', error);
  }
}

export const serverDb = {
  getDatabase(): DatabaseSchema {
    return ensureDbFile();
  },

  getStores(organizationId?: string, isOwner?: boolean): StoreInfo[] {
    const db = ensureDbFile();
    if (isOwner || !organizationId) {
      return db.stores;
    }
    return db.stores.filter(s => s.organizationId === organizationId);
  },

  getActiveStoreId(): string {
    const db = ensureDbFile();
    return db.activeStoreId || db.stores[0]?.id || 'store-1';
  },

  setActiveStoreId(id: string): void {
    const db = ensureDbFile();
    db.activeStoreId = id;
    writeDb(db);
  },

  getStore(storeId: string): StoreInfo | undefined {
    const db = ensureDbFile();
    return db.stores.find(s => s.id === storeId);
  },

  createStore(payload: {
    name: string;
    handle?: string;
    region: 'US' | 'UK' | 'EU' | 'CA' | 'AU' | 'GLOBAL';
    currency?: string;
    currencySymbol?: string;
    tiktokCommissionPercent?: number;
    withDemoData?: boolean;
    organizationId?: string;
  }): StoreInfo {
    const db = ensureDbFile();
    const newId = `store-${Date.now()}`;
    const curr = payload.currency || (payload.region === 'UK' ? 'GBP' : payload.region === 'EU' ? 'EUR' : 'USD');
    const sym = payload.currencySymbol || (curr === 'GBP' ? '£' : curr === 'EUR' ? '€' : '$');
    const comm = payload.tiktokCommissionPercent ?? (payload.region === 'UK' ? 9.0 : 10.0);

    const newSettings: StoreSettings = {
      ...DEFAULT_SETTINGS,
      storeName: payload.name,
      storeHandle: payload.handle || `@${payload.name.toLowerCase().replace(/\s+/g, '')}_shop`,
      currency: curr,
      currencySymbol: sym,
      tiktokCommissionPercent: comm,
      defaultShippingCost: curr === 'GBP' ? 2.2 : 2.5,
      defaultPackagingCost: curr === 'GBP' ? 0.8 : 1.0,
      targetProfitMarginPercent: 35.0,
    };

    let sampleProducts: ProductItem[] = [];
    let sampleListings: ListingItem[] = [];
    let sampleOrders: OrderEconomics[] = [];
    let sampleMonthly: MonthlyDataPoint[] = [];

    if (payload.withDemoData) {
      sampleProducts = [
        {
          id: `prod-${newId}-1`,
          name: `${payload.name} Hero Item 1`,
          sku: `SKU-${Math.floor(100 + Math.random() * 900)}`,
          category: 'Trending Viral',
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80',
          costPrice: 8.50,
          shippingCost: newSettings.defaultShippingCost,
          packagingCost: newSettings.defaultPackagingCost,
          otherProductCost: 0,
          tiktokCommissionPercent: comm,
          transactionFeePercent: 2.0,
          affiliatePercent: 5.0,
          tiktokAdsCost: 3.5,
          creatorCost: 0,
          otherMarketingCost: 0,
          customExpenses: 0,
          sellingPrice: 29.99,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
          status: 'excellent',
          bestFor: 'Top Performer ⭐',
          notes: 'High conversion potential with TikTok Spark Ads.',
          inComparison: true,
        }
      ];

      sampleListings = [
        {
          id: `list-${newId}-1`,
          productId: sampleProducts[0].id,
          productName: `${sampleProducts[0].name} Fast Dispatch Qi-Certified`,
          sku: sampleProducts[0].sku,
          sellingPrice: sampleProducts[0].sellingPrice,
          costPrice: sampleProducts[0].costPrice,
          expectedProfit: 12.50,
          expectedMargin: 41.7,
          category: 'Trending Items > TikTok Must Haves',
          description: `Premium quality ${sampleProducts[0].name} for TikTok viral campaigns.`,
          keyFeatures: ['Viral design aesthetics', 'Fast local warehouse shipping', 'Tested high-margin unit economics'],
          tags: [`#${payload.name.toLowerCase().replace(/\s+/g, '')}`, '#tiktokmademebuyit', '#trending'],
          status: 'ready',
          createdAt: new Date().toISOString().split('T')[0],
        }
      ];

      sampleOrders = [
        {
          id: `TT-${Math.floor(100000 + Math.random() * 900000)}`,
          product: sampleProducts[0].name,
          customer: 'Alex Rivera',
          date: 'Today, 2:15 PM',
          sellingPrice: sampleProducts[0].sellingPrice,
          productCost: sampleProducts[0].costPrice,
          shippingAndPkg: newSettings.defaultShippingCost + newSettings.defaultPackagingCost,
          tiktokFees: 4.20,
          adCPA: 3.50,
          netProfit: 10.29,
          margin: 34.3,
          status: 'Shipped',
        }
      ];

      sampleMonthly = [
        { month: 'Nov', profit: 3200, revenue: 9800, margin: 32.6, peak: false },
        { month: 'Dec', profit: 5400, revenue: 16200, margin: 33.3, peak: false },
        { month: 'Jan', profit: 4800, revenue: 14500, margin: 33.1, peak: false },
        { month: 'Feb', profit: 6700, revenue: 19800, margin: 33.8, peak: false },
        { month: 'Mar', profit: 8200, revenue: 24100, margin: 34.0, peak: false },
        { month: 'Apr', profit: 9900, revenue: 28900, margin: 34.2, peak: false },
        { month: 'May', profit: 11450, revenue: 33200, margin: 34.5, peak: true },
      ];
    } else {
      sampleMonthly = [
        { month: 'Nov', profit: 0, revenue: 0, margin: 0, peak: false },
        { month: 'Dec', profit: 0, revenue: 0, margin: 0, peak: false },
        { month: 'Jan', profit: 0, revenue: 0, margin: 0, peak: false },
        { month: 'Feb', profit: 0, revenue: 0, margin: 0, peak: false },
        { month: 'Mar', profit: 0, revenue: 0, margin: 0, peak: false },
        { month: 'Apr', profit: 0, revenue: 0, margin: 0, peak: false },
        { month: 'May', profit: 0, revenue: 0, margin: 0, peak: false },
      ];
    }

    const newStore: StoreInfo = {
      id: newId,
      organizationId: payload.organizationId || 'org-owner',
      name: payload.name,
      handle: payload.handle || `@${payload.name.toLowerCase().replace(/\s+/g, '')}`,
      region: payload.region,
      currency: curr,
      currencySymbol: sym,
      settings: newSettings,
      products: sampleProducts,
      listings: sampleListings,
      orders: sampleOrders,
      monthlyData: sampleMonthly,
    };

    db.stores.push(newStore);
    db.activeStoreId = newId;
    writeDb(db);
    return newStore;
  },

  deleteStore(storeId: string): boolean {
    const db = ensureDbFile();
    if (db.stores.length <= 1) return false;
    db.stores = db.stores.filter(s => s.id !== storeId);
    if (db.activeStoreId === storeId) {
      db.activeStoreId = db.stores[0].id;
    }
    writeDb(db);
    return true;
  },

  // Products
  getProducts(storeId: string): ProductItem[] {
    const store = this.getStore(storeId);
    return store?.products || [];
  },

  saveProduct(storeId: string, product: Partial<ProductItem>): ProductItem {
    const db = ensureDbFile();
    const store = db.stores.find(s => s.id === storeId);
    if (!store) throw new Error(`Store with id ${storeId} not found`);

    const now = new Date().toISOString().split('T')[0];
    let saved: ProductItem;

    if (product.id) {
      const idx = store.products.findIndex(p => p.id === product.id);
      if (idx >= 0) {
        saved = {
          ...store.products[idx],
          ...product,
          updatedAt: now,
        } as ProductItem;
        store.products[idx] = saved;
      } else {
        saved = {
          ...product,
          id: product.id,
          createdAt: now,
          updatedAt: now,
        } as ProductItem;
        store.products.push(saved);
      }
    } else {
      saved = {
        id: `prod-${storeId}-${Date.now()}`,
        name: product.name || 'New TikTok Product',
        sku: product.sku || `SKU-${Date.now().toString().slice(-4)}`,
        category: product.category || 'General',
        image: product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80',
        costPrice: Number(product.costPrice) || 0,
        shippingCost: Number(product.shippingCost ?? store.settings.defaultShippingCost) || 0,
        shippingCharge: Number(product.shippingCharge) || 0,
        packagingCost: Number(product.packagingCost ?? store.settings.defaultPackagingCost) || 0,
        otherProductCost: Number(product.otherProductCost) || 0,
        tiktokCommissionPercent: Number(product.tiktokCommissionPercent ?? store.settings.tiktokCommissionPercent) || 10,
        transactionFeePercent: Number(product.transactionFeePercent ?? store.settings.transactionFeePercent) || 2,
        affiliatePercent: Number(product.affiliatePercent ?? store.settings.defaultAffiliatePercent) || 5,
        tiktokAdsCost: Number(product.tiktokAdsCost) || 0,
        creatorCost: Number(product.creatorCost) || 0,
        otherMarketingCost: Number(product.otherMarketingCost) || 0,
        customExpenses: Number(product.customExpenses) || 0,
        sellingPrice: Number(product.sellingPrice) || 29.99,
        createdAt: now,
        updatedAt: now,
        status: product.status || 'good',
        bestFor: product.bestFor,
        notes: product.notes,
        inComparison: product.inComparison ?? true,
      };
      store.products.unshift(saved);
    }

    writeDb(db);
    return saved;
  },

  deleteProduct(storeId: string, productId: string): boolean {
    const db = ensureDbFile();
    const store = db.stores.find(s => s.id === storeId);
    if (!store) return false;
    store.products = store.products.filter(p => p.id !== productId);
    writeDb(db);
    return true;
  },

  // Listings
  getListings(storeId: string): ListingItem[] {
    const store = this.getStore(storeId);
    return store?.listings || [];
  },

  saveListing(storeId: string, listing: ListingItem): ListingItem {
    const db = ensureDbFile();
    const store = db.stores.find(s => s.id === storeId);
    if (!store) throw new Error(`Store with id ${storeId} not found`);

    const idx = store.listings.findIndex(l => l.id === listing.id);
    if (idx >= 0) {
      store.listings[idx] = listing;
    } else {
      store.listings.unshift(listing);
    }

    writeDb(db);
    return listing;
  },

  deleteListing(storeId: string, listingId: string): boolean {
    const db = ensureDbFile();
    const store = db.stores.find(s => s.id === storeId);
    if (!store) return false;
    store.listings = store.listings.filter(l => l.id !== listingId);
    writeDb(db);
    return true;
  },

  // Orders
  getOrders(storeId?: string): OrderEconomics[] {
    const db = ensureDbFile();
    const targetId = storeId || db.activeStoreId;
    const store = db.stores.find(s => s.id === targetId) || db.stores[0];
    return store ? store.orders : [];
  },

  // Settings
  getSettings(storeId: string): StoreSettings {
    const store = this.getStore(storeId);
    return store?.settings || DEFAULT_SETTINGS;
  },

  saveSettings(storeId: string, newSettings: Partial<StoreSettings>): StoreSettings {
    const db = ensureDbFile();
    const store = db.stores.find(s => s.id === storeId);
    if (!store) throw new Error(`Store with id ${storeId} not found`);

    store.settings = {
      ...store.settings,
      ...newSettings,
    };

    writeDb(db);
    return store.settings;
  },

  updateSettings(storeId: string, newSettings: Partial<StoreSettings>): StoreSettings {
    const db = ensureDbFile();
    const store = db.stores.find(s => s.id === storeId) || db.stores[0];
    if (!store) throw new Error('Store not found');

    store.settings = {
      ...store.settings,
      ...newSettings,
    };

    writeDb(db);
    return store.settings;
  },

  // Users & Team Management
  getUsers(): UserAccount[] {
    const db = ensureDbFile();
    return db.users;
  },

  getUserById(userId: string): UserAccount | undefined {
    const db = ensureDbFile();
    return db.users.find(u => u.id === userId);
  },

  getUserByEmail(email: string): UserAccount | undefined {
    const db = ensureDbFile();
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  saveUser(userData: Partial<UserAccount>): UserAccount {
    const db = ensureDbFile();
    const now = new Date().toISOString();
    let savedUser: UserAccount;

    const existingIndex = userData.id 
      ? db.users.findIndex(u => u.id === userData.id)
      : db.users.findIndex(u => u.email.toLowerCase() === (userData.email || '').toLowerCase());

    const planTier: SubscriptionTier = userData.role === 'owner' ? 'lifetime_owner' : 'starter';
    const planInfo = SAAS_PLANS[planTier];

    if (existingIndex >= 0) {
      savedUser = {
        ...db.users[existingIndex],
        ...userData,
      } as UserAccount;
      db.users[existingIndex] = savedUser;
    } else {
      savedUser = {
        id: userData.id || `user-${Date.now()}`,
        organizationId: userData.organizationId || `org-${Date.now()}`,
        name: userData.name || 'Merchant User',
        email: (userData.email || '').toLowerCase().trim(),
        password: userData.password || 'password123',
        role: userData.role || 'store_manager',
        avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.name || 'Member')}`,
        assignedStoreIds: userData.assignedStoreIds || ['*'],
        subscription: userData.subscription || {
          tier: planTier,
          status: 'active',
          maxStores: planInfo.maxStores,
          maxProducts: planInfo.maxProducts,
          billingInterval: 'monthly',
        },
        isLocked: userData.isLocked || false,
        createdAt: now,
      };
      db.users.push(savedUser);
    }

    writeDb(db);
    return savedUser;
  },

  deleteUser(userId: string): boolean {
    const db = ensureDbFile();
    // Cannot delete the primary owner
    const target = db.users.find(u => u.id === userId);
    if (!target || target.role === 'owner') {
      return false;
    }
    db.users = db.users.filter(u => u.id !== userId);
    writeDb(db);
    return true;
  },

  toggleUserLock(userId: string, isLocked: boolean): UserAccount | undefined {
    const db = ensureDbFile();
    const user = db.users.find(u => u.id === userId);
    if (!user) return undefined;
    if (user.role !== 'owner') {
      user.isLocked = isLocked;
      writeDb(db);
    }
    return user;
  },

  updateUserSubscription(
    userId: string, 
    tier: SubscriptionTier, 
    status: 'active' | 'trialing' | 'past_due' | 'canceled' = 'active',
    billingInterval: 'monthly' | 'annual' = 'monthly'
  ): UserAccount | undefined {
    const db = ensureDbFile();
    const user = db.users.find(u => u.id === userId);
    if (!user) return undefined;

    const plan = SAAS_PLANS[tier] || SAAS_PLANS.starter;
    user.subscription = {
      tier,
      status,
      maxStores: plan.maxStores,
      maxProducts: plan.maxProducts,
      billingInterval,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    writeDb(db);
    return user;
  },

  getSaaSMetrics(): SaaSMetrics {
    const db = ensureDbFile();
    let totalMRR = 0;
    let activeSubscribers = 0;
    const planBreakdown = { starter: 0, pro: 0, agency: 0, trial: 0 };

    for (const user of db.users) {
      if (user.role === 'owner') continue;
      const sub = user.subscription;
      if (!sub) continue;

      if (sub.status === 'active' || sub.status === 'trialing') {
        activeSubscribers++;
        if (sub.tier === 'starter') {
          totalMRR += 29;
          planBreakdown.starter++;
        } else if (sub.tier === 'pro') {
          totalMRR += 79;
          planBreakdown.pro++;
        } else if (sub.tier === 'agency') {
          totalMRR += 199;
          planBreakdown.agency++;
        } else if (sub.tier === 'trial') {
          planBreakdown.trial++;
        }
      }
    }

    return {
      totalMRR,
      activeSubscribers,
      planBreakdown,
      totalStores: db.stores.length,
    };
  }
};
