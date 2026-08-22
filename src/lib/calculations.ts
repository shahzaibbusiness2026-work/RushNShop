import { CalculationResult, ProductItem, StoreSettings } from '@/types';

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'My TikTok Shop',
  storeHandle: '@mytiktokshop',
  currency: 'USD',
  currencySymbol: '$',
  tiktokCommissionPercent: 10,
  defaultShippingCost: 2.00,
  defaultPackagingCost: 1.00,
  transactionFeePercent: 2.00,
  defaultAffiliatePercent: 5.00,
  targetProfitMarginPercent: 35,
  minimumAcceptableProfit: 5.00,
  lowMarginThresholdPercent: 20,
  autoAiTips: true,
};

export function calculateProductProfit(
  product: Partial<ProductItem>,
  settings: StoreSettings = DEFAULT_SETTINGS
): CalculationResult {
  const sellingPrice = Number(product.sellingPrice) || 0;
  const costPrice = Number(product.costPrice) || 0;
  const shippingCost = Number(product.shippingCost ?? settings.defaultShippingCost) || 0;
  const packagingCost = Number(product.packagingCost ?? settings.defaultPackagingCost) || 0;
  const otherProductCost = Number(product.otherProductCost) || 0;

  // Fee rates
  const commRate = Number(product.tiktokCommissionPercent ?? settings.tiktokCommissionPercent) || 0;
  const transRate = Number(product.transactionFeePercent ?? settings.transactionFeePercent) || 0;
  const affRate = Number(product.affiliatePercent ?? settings.defaultAffiliatePercent) || 0;
  const totalFeePercent = commRate + transRate + affRate;

  // Fees in currency
  const commissionFee = (sellingPrice * commRate) / 100;
  const transactionFee = (sellingPrice * transRate) / 100;
  const affiliateFee = (sellingPrice * affRate) / 100;
  const tiktokFeesTotal = commissionFee + transactionFee + affiliateFee;

  // Marketing
  const tiktokAdsCost = Number(product.tiktokAdsCost) || 0;
  const creatorCost = Number(product.creatorCost) || 0;
  const otherMarketingCost = Number(product.otherMarketingCost) || 0;
  const marketingTotal = tiktokAdsCost + creatorCost + otherMarketingCost;

  // Custom & Totals
  const customExpenses = Number(product.customExpenses) || 0;
  const productCostTotal = costPrice + shippingCost + packagingCost + otherProductCost;
  const totalCostPerOrder = productCostTotal + tiktokFeesTotal + marketingTotal + customExpenses;

  const revenue = sellingPrice;
  const netProfit = revenue - totalCostPerOrder;
  const profitMarginPercent = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  const costPercent = revenue > 0 ? (totalCostPerOrder / revenue) * 100 : 0;

  // Fixed costs (all non-% fees)
  const fixedCosts = productCostTotal + marketingTotal + customExpenses;
  const variableFeeRate = totalFeePercent / 100;

  // Break-even selling price
  const breakEvenSellingPrice = variableFeeRate < 0.99 
    ? fixedCosts / (1 - variableFeeRate)
    : fixedCosts;

  // Max affordable ad cost (CAC) before falling below minimum acceptable profit
  const minProfitTarget = settings.minimumAcceptableProfit || 0;
  const marketingWithoutAds = creatorCost + otherMarketingCost;
  const netBeforeAds = revenue - (productCostTotal + tiktokFeesTotal + marketingWithoutAds + customExpenses);
  const maxAffordableAdCost = Math.max(0, netBeforeAds - minProfitTarget);

  // Recommended selling price to achieve target profit margin
  const targetMarginRate = (settings.targetProfitMarginPercent || 35) / 100;
  const divisor = 1 - (variableFeeRate + targetMarginRate);
  const recommendedSellingPrice = divisor > 0.05
    ? fixedCosts / divisor
    : fixedCosts * 1.5;

  // Determine health status
  const targetMargin = settings.targetProfitMarginPercent || 35;
  const minProfit = settings.minimumAcceptableProfit || 5;
  const lowThreshold = settings.lowMarginThresholdPercent || 20;

  let profitHealthStatus: 'excellent' | 'good' | 'low' | 'loss' = 'good';
  let profitHealthScore = 75;

  if (netProfit < 0 || profitMarginPercent < 0) {
    profitHealthStatus = 'loss';
    profitHealthScore = Math.max(10, Math.round(30 + profitMarginPercent));
  } else if (profitMarginPercent < lowThreshold || netProfit < minProfit) {
    profitHealthStatus = 'low';
    profitHealthScore = Math.min(65, Math.max(40, Math.round(50 + profitMarginPercent * 0.5)));
  } else if (profitMarginPercent >= targetMargin && netProfit >= minProfit) {
    profitHealthStatus = 'excellent';
    profitHealthScore = Math.min(100, Math.round(80 + (profitMarginPercent - targetMargin) * 0.8));
  } else {
    profitHealthStatus = 'good';
    profitHealthScore = Math.round(65 + ((profitMarginPercent - lowThreshold) / (targetMargin - lowThreshold)) * 15);
  }

  // Dynamic Checks
  const checks = [
    {
      label: `Margin is above your target (${targetMargin}%)`,
      passed: profitMarginPercent >= targetMargin,
      detail: profitMarginPercent >= targetMargin 
        ? `Currently at ${profitMarginPercent.toFixed(1)}% (Target: ${targetMargin}%)`
        : `Currently ${profitMarginPercent.toFixed(1)}%, which is ${(targetMargin - profitMarginPercent).toFixed(1)}% below target`,
    },
    {
      label: `Profit is above minimum (${settings.currencySymbol}${minProfit.toFixed(2)})`,
      passed: netProfit >= minProfit,
      detail: netProfit >= minProfit
        ? `Net profit is ${settings.currencySymbol}${netProfit.toFixed(2)}`
        : `Profit is only ${settings.currencySymbol}${netProfit.toFixed(2)}, below your minimum threshold of ${settings.currencySymbol}${minProfit.toFixed(2)}`,
    },
    {
      label: 'Good balance of costs',
      passed: costPercent <= 65 && productCostTotal <= sellingPrice * 0.5,
      detail: costPercent <= 65 
        ? `Costs account for ${costPercent.toFixed(1)}% of selling price`
        : `Costs take up ${costPercent.toFixed(1)}% of price, leaving tight room for ads`,
    }
  ];

  // AI Recommendation text
  let aiRecommendation = '';
  if (profitHealthStatus === 'excellent') {
    aiRecommendation = `Strong unit economics! You have room to spend up to ${settings.currencySymbol}${maxAffordableAdCost.toFixed(2)} on TikTok ads per conversion while staying profitable.`;
  } else if (profitHealthStatus === 'good') {
    const priceDiff = recommendedSellingPrice - sellingPrice;
    if (priceDiff > 0.5) {
      aiRecommendation = `Solid margin. Consider bumping price from ${settings.currencySymbol}${sellingPrice.toFixed(2)} to ${settings.currencySymbol}${recommendedSellingPrice.toFixed(2)} (+${settings.currencySymbol}${priceDiff.toFixed(2)}) to hit your ${targetMargin}% target margin.`;
    } else {
      aiRecommendation = `Healthy margin. Keep TikTok ad CPA under ${settings.currencySymbol}${maxAffordableAdCost.toFixed(2)} to maintain minimum profit.`;
    }
  } else if (profitHealthStatus === 'low') {
    aiRecommendation = `Low margin alert. To hit ${targetMargin}% margin, increase selling price to ${settings.currencySymbol}${recommendedSellingPrice.toFixed(2)} or reduce ad CPA below ${settings.currencySymbol}${maxAffordableAdCost.toFixed(2)}.`;
  } else {
    aiRecommendation = `Critical loss warning: You are losing ${settings.currencySymbol}${Math.abs(netProfit).toFixed(2)} per order. Break-even price is ${settings.currencySymbol}${breakEvenSellingPrice.toFixed(2)}. Immediate price increase or supplier cost negotiation required.`;
  }

  return {
    baseCost: costPrice,
    shippingCost,
    packagingCost,
    otherProductCost,
    productCostTotal,
    commissionFee,
    transactionFee,
    affiliateFee,
    tiktokFeesTotal,
    tiktokFeesPercentTotal: totalFeePercent,
    tiktokAdsCost,
    creatorCost,
    otherMarketingCost,
    marketingTotal,
    customExpenses,
    revenue,
    totalCostPerOrder,
    netProfit,
    profitMarginPercent,
    costPercent,
    breakEvenSellingPrice,
    maxAffordableAdCost,
    recommendedSellingPrice,
    profitHealthStatus,
    profitHealthScore,
    checks,
    aiRecommendation,
  };
}
