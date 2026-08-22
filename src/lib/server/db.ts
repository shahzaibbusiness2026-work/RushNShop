import fs from 'fs';
import path from 'path';
import { StoreInfo, ProductItem, ListingItem, OrderEconomics, StoreSettings, MonthlyDataPoint } from '@/types';
import { INITIAL_STORES } from '@/lib/defaultData';
import { DEFAULT_SETTINGS } from '@/lib/calculations';

interface DatabaseSchema {
  stores: StoreInfo[];
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
        inMemoryCache = parsed;
        return inMemoryCache;
      }
    }
  } catch (error) {
    console.warn('[RushNshop DB] Filesystem read error, using in-memory store:', error);
  }

  const initialData: DatabaseSchema = {
    stores: INITIAL_STORES,
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

  getStores(): StoreInfo[] {
    const db = ensureDbFile();
    return db.stores;
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
  getProducts(storeId?: string): ProductItem[] {
    const db = ensureDbFile();
    const targetId = storeId || db.activeStoreId;
    const store = db.stores.find(s => s.id === targetId) || db.stores[0];
    return store ? store.products : [];
  },

  saveProduct(storeId: string, product: Partial<ProductItem>): ProductItem {
    const db = ensureDbFile();
    const store = db.stores.find(s => s.id === storeId) || db.stores[0];
    if (!store) throw new Error('Store not found');

    const now = new Date().toISOString().split('T')[0];
    const existingIndex = store.products.findIndex(p => p.id === product.id);

    let savedItem: ProductItem;

    if (existingIndex >= 0 && product.id) {
      savedItem = {
        ...store.products[existingIndex],
        ...product,
        updatedAt: now,
      } as ProductItem;
      store.products[existingIndex] = savedItem;
    } else {
      savedItem = {
        id: `prod-${Date.now()}`,
        name: product.name || 'Untitled Product',
        sku: product.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        category: product.category || 'General',
        image: product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80',
        costPrice: Number(product.costPrice) || 0,
        shippingCost: Number(product.shippingCost ?? store.settings.defaultShippingCost) || 0,
        packagingCost: Number(product.packagingCost ?? store.settings.defaultPackagingCost) || 0,
        otherProductCost: Number(product.otherProductCost) || 0,
        tiktokCommissionPercent: Number(product.tiktokCommissionPercent ?? store.settings.tiktokCommissionPercent) || 0,
        transactionFeePercent: Number(product.transactionFeePercent ?? store.settings.transactionFeePercent) || 0,
        affiliatePercent: Number(product.affiliatePercent ?? store.settings.defaultAffiliatePercent) || 0,
        tiktokAdsCost: Number(product.tiktokAdsCost) || 0,
        creatorCost: Number(product.creatorCost) || 0,
        otherMarketingCost: Number(product.otherMarketingCost) || 0,
        customExpenses: Number(product.customExpenses) || 0,
        sellingPrice: Number(product.sellingPrice) || 0,
        createdAt: now,
        updatedAt: now,
        status: product.status || 'good',
        bestFor: product.bestFor || 'Standard',
        notes: product.notes || '',
        inComparison: false,
      };
      store.products.unshift(savedItem);
    }

    writeDb(db);
    return savedItem;
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
  getListings(storeId?: string): ListingItem[] {
    const db = ensureDbFile();
    const targetId = storeId || db.activeStoreId;
    const store = db.stores.find(s => s.id === targetId) || db.stores[0];
    return store ? store.listings : [];
  },

  saveListing(storeId: string, listing: ListingItem): ListingItem {
    const db = ensureDbFile();
    const store = db.stores.find(s => s.id === storeId) || db.stores[0];
    if (!store) throw new Error('Store not found');

    const existingIndex = store.listings.findIndex(l => l.id === listing.id);
    if (existingIndex >= 0) {
      store.listings[existingIndex] = listing;
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
  }
};
