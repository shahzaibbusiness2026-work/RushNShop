'use client';

import React, { useState } from 'react';
import { ShoppingBag, Search, CheckCircle2, Clock, Truck, TrendingUp, Download, FileSpreadsheet } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatCurrency, formatPercent, exportToCSV } from '@/lib/utils';
import { exportToGoogleSheetsCSV, copyForGoogleSheets } from '@/lib/exportUtils';

export default function OrdersPage() {
  const { orders, settings, showToast } = useStore();
  const [search, setSearch] = useState('');

  const activeOrders = orders && orders.length > 0 ? orders : [];

  const filtered = activeOrders.filter(o => 
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.product.toLowerCase().includes(search.toLowerCase()) ||
    o.customer.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportGoogleSheets = () => {
    const data = activeOrders.map(o => ({
      'Order ID': o.id,
      'Product': o.product,
      'Customer': o.customer,
      'Date': o.date,
      'Revenue ($)': o.sellingPrice,
      'Product & Shipping Cost ($)': o.productCost + o.shippingAndPkg,
      'TikTok Fees ($)': o.tiktokFees,
      'Paid Ad CAC ($)': o.adCPA,
      'Net Profit ($)': o.netProfit,
      'Margin (%)': `${o.margin}%`,
      'Status': o.status,
    }));
    exportToGoogleSheetsCSV(`RushNshop-Orders-${Date.now()}`, data);
    showToast('Exported to Google Sheets', 'Downloaded Google Sheets formatted CSV.', 'success');
  };

  const handleCopyGoogleSheets = () => {
    const data = activeOrders.map(o => ({
      'Order ID': o.id,
      'Product': o.product,
      'Revenue': `${settings.currencySymbol}${o.sellingPrice}`,
      'Cost': `${settings.currencySymbol}${o.productCost + o.shippingAndPkg}`,
      'Fees': `${settings.currencySymbol}${o.tiktokFees}`,
      'Ad CPA': `${settings.currencySymbol}${o.adCPA}`,
      'Net Profit': `${settings.currencySymbol}${o.netProfit}`,
      'Margin': `${o.margin}%`,
      'Status': o.status,
    }));
    const success = copyForGoogleSheets(data);
    if (success) {
      showToast('Copied for Google Sheets', 'Tab-separated order data copied (Ctrl+V).', 'success');
    }
  };

  const handleExport = () => {
    exportToCSV(`RushNshop-Orders-Economics-${Date.now()}`, activeOrders);
    showToast('Orders Exported', 'Downloaded order profitability statement.', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Order Economics & Realized Profits
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Live order-level profit tracking deducting supplier costs, TikTok commissions, and paid ad CAC.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyGoogleSheets}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-colors"
            title="Copy for Google Sheets"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Copy Google Sheets</span>
          </button>

          <button
            onClick={handleExportGoogleSheets}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Google Sheets CSV</span>
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-brand-600 hover:bg-slate-800 dark:hover:bg-brand-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Standard CSV</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search order ID, customer, product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-400 uppercase font-bold text-[11px]">
                <th className="py-3.5 px-5">Order ID</th>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Revenue</th>
                <th className="py-3.5 px-4">Product + Ship</th>
                <th className="py-3.5 px-4">TikTok Fees</th>
                <th className="py-3.5 px-4">Ad CAC</th>
                <th className="py-3.5 px-4">Realized Profit</th>
                <th className="py-3.5 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white">
                    {order.id}
                    <span className="block text-[10px] font-normal text-slate-400">{order.date}</span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {order.product}
                    <span className="block text-[10px] font-normal text-slate-400">{order.customer}</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {formatCurrency(order.sellingPrice, settings.currencySymbol)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium">
                    {formatCurrency(order.productCost + order.shippingAndPkg, settings.currencySymbol)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium">
                    {formatCurrency(order.tiktokFees, settings.currencySymbol)}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                    {order.adCPA === 0 ? (
                      <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded font-bold text-[10px]">Organic $0</span>
                    ) : (
                      formatCurrency(order.adCPA, settings.currencySymbol)
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(order.netProfit, settings.currencySymbol)}
                    <span className="ml-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">({order.margin}%)</span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
