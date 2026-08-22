export type ProfitHealthStatus = 'excellent' | 'good' | 'low' | 'loss';

export interface ProductItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  image: string;
  // Costs
  costPrice: number;
  shippingCost: number;
  packagingCost: number;
  otherProductCost: number;
  // Fees (Percentages)
  tiktokCommissionPercent: number;
  transactionFeePercent: number;
  affiliatePercent: number;
  // Marketing Costs
  tiktokAdsCost: number;
  creatorCost: number;
  otherMarketingCost: number;
  // Custom
  customExpenses: number;
  // Price
  sellingPrice: number;
  // Meta
  createdAt: string;
  updatedAt: string;
  status?: ProfitHealthStatus;
  bestFor?: string;
  notes?: string;
  inComparison?: boolean;
}

export interface CalculationResult {
  // Line items
  baseCost: number;
  shippingCost: number;
  packagingCost: number;
  otherProductCost: number;
  productCostTotal: number;

  // Fees
  commissionFee: number;
  transactionFee: number;
  affiliateFee: number;
  tiktokFeesTotal: number;
  tiktokFeesPercentTotal: number;

  // Marketing
  tiktokAdsCost: number;
  creatorCost: number;
  otherMarketingCost: number;
  marketingTotal: number;

  // Custom
  customExpenses: number;

  // Overall
  revenue: number;
  totalCostPerOrder: number;
  netProfit: number;
  profitMarginPercent: number;
  costPercent: number;

  // Pro Metrics from blueprint
  breakEvenSellingPrice: number;
  maxAffordableAdCost: number;
  recommendedSellingPrice: number;

  // Health
  profitHealthStatus: ProfitHealthStatus;
  profitHealthScore: number;
  checks: {
    label: string;
    passed: boolean;
    detail: string;
  }[];
  aiRecommendation: string;
}

export interface StoreSettings {
  storeName: string;
  storeHandle: string;
  currency: string;
  currencySymbol: string;
  tiktokCommissionPercent: number;
  defaultShippingCost: number;
  defaultPackagingCost: number;
  transactionFeePercent: number;
  defaultAffiliatePercent: number;
  targetProfitMarginPercent: number;
  minimumAcceptableProfit: number;
  lowMarginThresholdPercent: number;
  autoAiTips: boolean;
}

export interface ListingItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  sellingPrice: number;
  costPrice: number;
  expectedProfit: number;
  expectedMargin: number;
  category: string;
  description: string;
  keyFeatures: string[];
  tags: string[];
  status: 'draft' | 'ready' | 'synced';
  createdAt: string;
}

export interface ComparisonMetrics {
  sellingPrice: number;
  productCost: number;
  shippingAndPackaging: number;
  tiktokFees: number;
  marketingCost: number;
  totalCost: number;
  netProfit: number;
  profitMargin: number;
  breakEvenPrice: number;
  maxAdCost: number;
}

export interface OrderEconomics {
  id: string;
  product: string;
  customer: string;
  date: string;
  sellingPrice: number;
  productCost: number;
  shippingAndPkg: number;
  tiktokFees: number;
  adCPA: number;
  netProfit: number;
  margin: number;
  status: 'Shipped' | 'Processing' | 'Delivered' | 'Cancelled';
}

export interface MonthlyDataPoint {
  month: string;
  profit: number;
  revenue: number;
  margin: number;
  peak?: boolean;
}

export interface StoreInfo {
  id: string;
  name: string;
  handle: string;
  region: 'US' | 'UK' | 'EU' | 'CA' | 'AU' | 'GLOBAL';
  currency: string;
  currencySymbol: string;
  settings: StoreSettings;
  products: ProductItem[];
  listings: ListingItem[];
  orders: OrderEconomics[];
  monthlyData: MonthlyDataPoint[];
}
