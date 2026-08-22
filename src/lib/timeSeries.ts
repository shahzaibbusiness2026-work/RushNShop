import { ProductItem, StoreSettings, MonthlyDataPoint } from '@/types';

export type TimeRangeType = 
  | 'today' 
  | 'week' 
  | 'month' 
  | 'quarter' 
  | 'year' 
  | 'all';

export interface ChartDataPoint {
  label: string;
  month?: string;
  profit: number;
  revenue: number;
  margin: number;
  peak?: boolean;
}

export interface TimeframeKpis {
  totalProfit: number;
  totalRevenue: number;
  avgMargin: number;
  productsSold: number;
  winningCount: number;
  lowMarginCount: number;
  profitChange: string;
  isPositive: boolean;
  timeframeLabel: string;
}

export function normalizeTimeRange(raw: string): TimeRangeType {
  const lower = raw.toLowerCase();
  if (lower.includes('today') || lower.includes('24h') || lower.includes('day')) return 'today';
  if (lower.includes('7') || lower.includes('week')) return 'week';
  if (lower.includes('30') || lower.includes('month') && !lower.includes('6') && !lower.includes('12')) return 'month';
  if (lower.includes('quarter') || lower.includes('q2') || lower.includes('6 month')) return 'quarter';
  if (lower.includes('year') || lower.includes('12 month') || lower.includes('ytd')) return 'year';
  if (lower.includes('all')) return 'all';
  return 'month';
}

export function getTimeframeData(
  rangeRaw: string,
  products: ProductItem[],
  settings: StoreSettings,
  monthlyData: MonthlyDataPoint[]
): { chartPoints: ChartDataPoint[]; kpis: TimeframeKpis; peakProfit: number } {
  const range = normalizeTimeRange(rangeRaw);

  // Compute store scale multiplier based on products & settings
  const avgSellingPrice = products.length > 0
    ? products.reduce((sum, p) => sum + (Number(p.sellingPrice) || 0), 0) / products.length
    : 29.99;

  const baseUnitProfit = products.length > 0
    ? products.reduce((sum, p) => {
        const fees = (p.sellingPrice * (p.tiktokCommissionPercent + p.transactionFeePercent + p.affiliatePercent)) / 100;
        const cost = p.costPrice + p.shippingCost + p.packagingCost + fees + p.tiktokAdsCost + p.creatorCost;
        return sum + Math.max(0, p.sellingPrice - cost);
      }, 0) / products.length
    : 10.50;

  const baseMonthlyProfit = monthlyData.length > 0 
    ? monthlyData[monthlyData.length - 1].profit 
    : 12500;

  const scale = baseMonthlyProfit / 12500;

  let chartPoints: ChartDataPoint[] = [];
  let totalProfit = 0;
  let totalRevenue = 0;
  let productsSold = 0;
  let profitChange = '+18.4%';
  let isPositive = true;
  let timeframeLabel = 'vs last month';

  switch (range) {
    case 'today': {
      timeframeLabel = 'vs yesterday';
      profitChange = '+14.2%';
      const hourlyDistribution = [
        { label: '12 AM', revMult: 0.04, profitMult: 0.04 },
        { label: '3 AM', revMult: 0.02, profitMult: 0.02 },
        { label: '6 AM', revMult: 0.06, profitMult: 0.06 },
        { label: '9 AM', revMult: 0.15, profitMult: 0.16 },
        { label: '12 PM', revMult: 0.22, profitMult: 0.23 },
        { label: '3 PM', revMult: 0.24, profitMult: 0.25 },
        { label: '6 PM', revMult: 0.18, profitMult: 0.17 },
        { label: '9 PM', revMult: 0.09, profitMult: 0.07 },
      ];

      const dayProfitBase = Math.round(baseMonthlyProfit / 30);
      const dayRevBase = Math.round(dayProfitBase * 2.9);

      chartPoints = hourlyDistribution.map((h, i) => {
        const p = Math.round(dayProfitBase * h.profitMult * 8);
        const r = Math.round(dayRevBase * h.revMult * 8);
        const m = r > 0 ? Number(((p / r) * 100).toFixed(1)) : 34.5;
        return {
          label: h.label,
          month: h.label,
          profit: p,
          revenue: r,
          margin: m,
          peak: i === 5,
        };
      });

      totalProfit = chartPoints.reduce((s, c) => s + c.profit, 0);
      totalRevenue = chartPoints.reduce((s, c) => s + c.revenue, 0);
      productsSold = Math.max(14, Math.round(totalRevenue / avgSellingPrice));
      break;
    }

    case 'week': {
      timeframeLabel = 'vs last week';
      profitChange = '+8.6%';
      const days = [
        { label: 'Mon', pFactor: 0.12, rFactor: 0.12 },
        { label: 'Tue', pFactor: 0.13, rFactor: 0.13 },
        { label: 'Wed', pFactor: 0.14, rFactor: 0.14 },
        { label: 'Thu', pFactor: 0.15, rFactor: 0.15 },
        { label: 'Fri', pFactor: 0.18, rFactor: 0.18 },
        { label: 'Sat', pFactor: 0.21, rFactor: 0.20 },
        { label: 'Sun', pFactor: 0.17, rFactor: 0.18 },
      ];

      const weekProfitBase = Math.round(baseMonthlyProfit * 0.26);
      const weekRevBase = Math.round(weekProfitBase * 2.9);

      chartPoints = days.map((d, i) => {
        const p = Math.round(weekProfitBase * d.pFactor * 7);
        const r = Math.round(weekRevBase * d.rFactor * 7);
        const m = r > 0 ? Number(((p / r) * 100).toFixed(1)) : 34.8;
        return {
          label: d.label,
          month: d.label,
          profit: p,
          revenue: r,
          margin: m,
          peak: i === 5,
        };
      });

      totalProfit = chartPoints.reduce((s, c) => s + c.profit, 0);
      totalRevenue = chartPoints.reduce((s, c) => s + c.revenue, 0);
      productsSold = Math.max(48, Math.round(totalRevenue / avgSellingPrice));
      break;
    }

    case 'quarter': {
      timeframeLabel = 'vs last quarter';
      profitChange = '+19.8%';
      const months = ['Mar', 'Apr', 'May'];
      const qProfits = [
        Math.round(baseMonthlyProfit * 0.78),
        Math.round(baseMonthlyProfit * 0.91),
        Math.round(baseMonthlyProfit)
      ];

      chartPoints = months.map((m, i) => {
        const p = qProfits[i];
        const r = Math.round(p * 2.92);
        return {
          label: m,
          month: m,
          profit: p,
          revenue: r,
          margin: 34.2,
          peak: i === 2,
        };
      });

      totalProfit = chartPoints.reduce((s, c) => s + c.profit, 0);
      totalRevenue = chartPoints.reduce((s, c) => s + c.revenue, 0);
      productsSold = Math.max(320, Math.round(totalRevenue / avgSellingPrice));
      break;
    }

    case 'year': {
      timeframeLabel = 'vs last year';
      profitChange = '+32.4%';
      const yearMonths = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
      const trendMultipliers = [0.35, 0.40, 0.44, 0.49, 0.55, 0.62, 0.75, 0.68, 0.82, 0.88, 0.94, 1.0];

      chartPoints = yearMonths.map((m, i) => {
        const p = Math.round(baseMonthlyProfit * trendMultipliers[i]);
        const r = Math.round(p * 2.92);
        return {
          label: m,
          month: m,
          profit: p,
          revenue: r,
          margin: Number((33.2 + i * 0.1).toFixed(1)),
          peak: i === 11,
        };
      });

      totalProfit = chartPoints.reduce((s, c) => s + c.profit, 0);
      totalRevenue = chartPoints.reduce((s, c) => s + c.revenue, 0);
      productsSold = Math.max(1200, Math.round(totalRevenue / avgSellingPrice));
      break;
    }

    case 'all': {
      timeframeLabel = 'all-time growth';
      profitChange = '+184.2%';
      const years = [
        { label: '2021', p: Math.round(baseMonthlyProfit * 3.2) },
        { label: '2022', p: Math.round(baseMonthlyProfit * 5.8) },
        { label: '2023', p: Math.round(baseMonthlyProfit * 8.4) },
        { label: '2024 (YTD)', p: Math.round(baseMonthlyProfit * 11.2) },
        { label: '2025 (Proj)', p: Math.round(baseMonthlyProfit * 15.6) },
      ];

      chartPoints = years.map((y, i) => {
        const r = Math.round(y.p * 2.9);
        return {
          label: y.label,
          month: y.label,
          profit: y.p,
          revenue: r,
          margin: Number((32.0 + i * 0.8).toFixed(1)),
          peak: i === 4,
        };
      });

      totalProfit = chartPoints.reduce((s, c) => s + c.profit, 0);
      totalRevenue = chartPoints.reduce((s, c) => s + c.revenue, 0);
      productsSold = Math.max(3500, Math.round(totalRevenue / avgSellingPrice));
      break;
    }

    case 'month':
    default: {
      timeframeLabel = 'vs last month';
      profitChange = '+22.1%';
      const monthWeeks = ['May 1-7', 'May 8-14', 'May 15-21', 'May 22-31'];
      const weekWeights = [0.21, 0.24, 0.27, 0.28];

      chartPoints = monthWeeks.map((w, i) => {
        const p = Math.round(baseMonthlyProfit * weekWeights[i]);
        const r = Math.round(p * 2.92);
        return {
          label: w,
          month: w,
          profit: p,
          revenue: r,
          margin: Number((33.5 + i * 0.3).toFixed(1)),
          peak: i === 3,
        };
      });

      totalProfit = baseMonthlyProfit;
      totalRevenue = Math.round(baseMonthlyProfit * 2.92);
      productsSold = Math.max(180, Math.round(totalRevenue / avgSellingPrice));
      break;
    }
  }

  const avgMargin = totalRevenue > 0 ? Number(((totalProfit / totalRevenue) * 100).toFixed(1)) : 34.2;
  const winningCount = products.filter(p => p.status === 'excellent' || p.status === 'good').length;
  const lowMarginCount = products.filter(p => p.status === 'low' || p.status === 'loss').length;
  const peakProfit = chartPoints.reduce((max, cur) => (cur.profit > max ? cur.profit : max), chartPoints[0]?.profit || 0);

  return {
    chartPoints,
    peakProfit,
    kpis: {
      totalProfit,
      totalRevenue,
      avgMargin,
      productsSold,
      winningCount,
      lowMarginCount,
      profitChange,
      isPositive,
      timeframeLabel,
    }
  };
}
