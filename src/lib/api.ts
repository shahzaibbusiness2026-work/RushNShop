import { StoreInfo, ProductItem, ListingItem, OrderEconomics, StoreSettings, UserAccount } from '@/types';

export const apiClient = {
  async getStores(): Promise<{ stores: StoreInfo[]; activeStoreId: string }> {
    const res = await fetch('/api/stores', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed fetching stores');
    const data = await res.json();
    return { stores: data.stores, activeStoreId: data.activeStoreId };
  },

  async createStore(payload: {
    name: string;
    handle?: string;
    region: 'US' | 'UK' | 'EU' | 'CA' | 'AU' | 'GLOBAL';
    currency?: string;
    currencySymbol?: string;
    tiktokCommissionPercent?: number;
    withDemoData?: boolean;
  }): Promise<StoreInfo> {
    const res = await fetch('/api/stores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed creating store');
    const data = await res.json();
    return data.store;
  },

  async deleteStore(storeId: string): Promise<boolean> {
    const res = await fetch(`/api/stores/${storeId}`, { method: 'DELETE' });
    return res.ok;
  },

  async getProducts(storeId: string): Promise<ProductItem[]> {
    const res = await fetch(`/api/products?storeId=${storeId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed fetching products');
    const data = await res.json();
    return data.products;
  },

  async saveProduct(storeId: string, product: Partial<ProductItem>): Promise<ProductItem> {
    const isUpdate = Boolean(product.id);
    const url = isUpdate ? `/api/products/${product.id}` : '/api/products';
    const method = isUpdate ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId, product }),
    });
    if (!res.ok) throw new Error('Failed saving product');
    const data = await res.json();
    return data.product;
  },

  async bulkSaveProducts(storeId: string, products: Partial<ProductItem>[]): Promise<ProductItem[]> {
    const res = await fetch('/api/products/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId, products }),
    });
    if (!res.ok) throw new Error('Failed bulk saving products');
    const data = await res.json();
    return data.products;
  },

  async deleteProduct(storeId: string, productId: string): Promise<boolean> {
    const res = await fetch(`/api/products/${productId}?storeId=${storeId}`, { method: 'DELETE' });
    return res.ok;
  },

  async getListings(storeId: string): Promise<ListingItem[]> {
    const res = await fetch(`/api/listings?storeId=${storeId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed fetching listings');
    const data = await res.json();
    return data.listings;
  },

  async saveListing(storeId: string, listing: ListingItem): Promise<ListingItem> {
    const res = await fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId, listing }),
    });
    if (!res.ok) throw new Error('Failed saving listing');
    const data = await res.json();
    return data.listing;
  },

  async deleteListing(storeId: string, listingId: string): Promise<boolean> {
    const res = await fetch(`/api/listings/${listingId}?storeId=${storeId}`, { method: 'DELETE' });
    return res.ok;
  },

  async getOrders(storeId: string): Promise<OrderEconomics[]> {
    const res = await fetch(`/api/orders?storeId=${storeId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed fetching orders');
    const data = await res.json();
    return data.orders;
  },

  async updateSettings(storeId: string, settings: Partial<StoreSettings>): Promise<StoreSettings> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId, settings }),
    });
    if (!res.ok) throw new Error('Failed updating settings');
    const data = await res.json();
    return data.settings;
  },

  // Users & Auth
  async getUsers(): Promise<UserAccount[]> {
    const res = await fetch('/api/users', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed fetching users');
    const data = await res.json();
    return data.users;
  },

  async saveUser(user: Partial<UserAccount>): Promise<UserAccount> {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed saving user' }));
      throw new Error(err.message || 'Failed saving user');
    }
    const data = await res.json();
    return data.user;
  },

  async deleteUser(userId: string): Promise<boolean> {
    const res = await fetch(`/api/users?id=${userId}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed deleting user' }));
      throw new Error(err.message || 'Failed deleting user');
    }
    return res.ok;
  },

  async toggleUserLock(userId: string, isLocked: boolean): Promise<UserAccount> {
    const res = await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, isLocked }),
    });
    if (!res.ok) throw new Error('Failed updating user lock state');
    const data = await res.json();
    return data.user;
  },

  async login(email: string, password: string): Promise<UserAccount> {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Invalid credentials' }));
      throw new Error(err.message || 'Invalid credentials');
    }
    const data = await res.json();
    return data.user;
  },

  async register(payload: { name: string; email: string; password: string; role?: string; assignedStoreIds?: string[] }): Promise<UserAccount> {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', ...payload }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed creating account' }));
      throw new Error(err.message || 'Failed creating account');
    }
    const data = await res.json();
    return data.user;
  }
};

