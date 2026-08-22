'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit3, 
  Copy, 
  Trash2, 
  Columns, 
  Download, 
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
  Printer,
  Upload
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatCurrency, formatPercent, exportToCSV, cn } from '@/lib/utils';
import { exportToGoogleSheetsCSV, copyForGoogleSheets } from '@/lib/exportUtils';
import { useRouter } from 'next/navigation';
import { calculateProductProfit } from '@/lib/calculations';
import PdfReportModal from '@/components/export/PdfReportModal';
import BulkUploadModal from '@/components/calculator/BulkUploadModal';

export default function HistoryPage() {
  const { 
    products, 
    settings, 
    loadProductIntoCalculator, 
    duplicateProduct, 
    deleteProduct, 
    toggleCompareProduct,
    comparisonProductIds,
    resetCalculator,
    showToast
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'excellent' | 'good' | 'low' | 'loss'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [bulkUploadModalOpen, setBulkUploadModalOpen] = useState(false);
  const itemsPerPage = 5;

  const router = useRouter();

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  // Filter products
  const filteredProducts = products.filter((p) => {
    const calc = calculateProductProfit(p, settings);
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || calc.profitHealthStatus === statusFilter;
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleEdit = (id: string) => {
    loadProductIntoCalculator(id);
    router.push('/calculator');
  };

  const handleExportAll = () => {
    const exportRows = filteredProducts.map(p => {
      const calc = calculateProductProfit(p, settings);
      return {
        Product: p.name,
        SKU: p.sku,
        Category: p.category,
        SellingPrice: p.sellingPrice.toFixed(2),
        ProductCost: calc.productCostTotal.toFixed(2),
        TikTokFees: calc.tiktokFeesTotal.toFixed(2),
        MarketingCost: calc.marketingTotal.toFixed(2),
        NetProfit: calc.netProfit.toFixed(2),
        ProfitMargin: `${calc.profitMarginPercent.toFixed(1)}%`,
        Status: calc.profitHealthStatus,
        DateCreated: p.createdAt,
      };
    });
    exportToCSV(`RushNshop-Saved-Calculations-${Date.now()}`, exportRows);
    showToast('Exported', 'Saved calculations exported to CSV.', 'success');
  };

  const handleExportGoogleSheets = () => {
    const exportRows = filteredProducts.map(p => {
      const calc = calculateProductProfit(p, settings);
      return {
        'Product Name': p.name,
        'SKU': p.sku,
        'Category': p.category,
        'Selling Price ($)': p.sellingPrice,
        'Product Cost ($)': calc.productCostTotal,
        'TikTok Fees ($)': calc.tiktokFeesTotal,
        'Marketing CAC ($)': calc.marketingTotal,
        'Net Profit ($)': calc.netProfit,
        'Profit Margin (%)': `${calc.profitMarginPercent.toFixed(1)}%`,
        'Break-Even ($)': calc.breakEvenSellingPrice.toFixed(2),
        'Max Ad CPA ($)': calc.maxAffordableAdCost.toFixed(2),
        'Status': calc.profitHealthStatus,
        'Date Created': p.createdAt,
      };
    });
    exportToGoogleSheetsCSV(`RushNshop-Saved-Products-${Date.now()}`, exportRows);
    showToast('Exported to Google Sheets', 'Downloaded Google Sheets formatted CSV.', 'success');
  };

  const handleCopyGoogleSheets = () => {
    const exportRows = filteredProducts.map(p => {
      const calc = calculateProductProfit(p, settings);
      return {
        'Product Name': p.name,
        'SKU': p.sku,
        'Category': p.category,
        'Selling Price': p.sellingPrice,
        'Product Cost': calc.productCostTotal,
        'TikTok Fees': calc.tiktokFeesTotal,
        'Ad Spend': calc.marketingTotal,
        'Net Profit': calc.netProfit,
        'Margin %': `${calc.profitMarginPercent.toFixed(1)}%`,
        'Status': calc.profitHealthStatus,
      };
    });
    const copied = copyForGoogleSheets(exportRows);
    if (copied) {
      showToast('Copied to Clipboard', 'Ready to paste (Ctrl+V) into Google Sheets.', 'success');
    }
  };

  const handleNewCalculation = () => {
    resetCalculator();
    router.push('/calculator');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Product History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            View and manage your saved calculations, evaluate historical unit economics, and export reports.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setBulkUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-brand-50 dark:bg-brand-950 hover:bg-brand-100 dark:hover:bg-brand-900 border border-brand-200/80 dark:border-brand-800/80 rounded-xl text-xs font-semibold text-brand-700 dark:text-brand-300 shadow-2xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Bulk Upload CSV</span>
          </button>

          <button
            onClick={handleCopyGoogleSheets}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-colors"
            title="Copy to paste in Google Sheets"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Copy Google Sheets</span>
          </button>

          <button
            onClick={handleExportGoogleSheets}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Google Sheets CSV</span>
          </button>

          <button
            onClick={() => setPdfModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 dark:bg-brand-600 hover:bg-slate-800 dark:hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PDF Report</span>
          </button>

          <button
            onClick={handleNewCalculation}
            className="flex items-center gap-2 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Calculation</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-card overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products, SKUs..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Filter Pills / Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              {(['all', 'excellent', 'good', 'low', 'loss'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "px-3 py-1 rounded-lg capitalize transition-all",
                    statusFilter === st
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-400 uppercase font-bold tracking-wider text-[11px]">
                <th className="py-3.5 px-5">Product</th>
                <th className="py-3.5 px-4">Selling Price</th>
                <th className="py-3.5 px-4">Profit</th>
                <th className="py-3.5 px-4">Margin</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No saved calculations found</p>
                    <p className="text-xs mt-1">Try adjusting your search query or calculate a new product.</p>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => {
                  const calc = calculateProductProfit(product, settings);
                  const inComp = comparisonProductIds.includes(product.id);

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group">
                      {/* Product Name & SKU & Thumbnail */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 overflow-hidden shrink-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <span 
                              onClick={() => handleEdit(product.id)}
                              className="font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer text-xs sm:text-sm transition-colors"
                            >
                              {product.name}
                            </span>
                            <p className="text-[11px] text-slate-400 font-medium">
                              {product.sku} • <span className="text-slate-500 dark:text-slate-400">{product.category}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Selling Price */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {formatCurrency(product.sellingPrice, settings.currencySymbol)}
                      </td>

                      {/* Net Profit */}
                      <td className="py-3.5 px-4 font-bold">
                        <span className={calc.netProfit < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                          {formatCurrency(calc.netProfit, settings.currencySymbol)}
                        </span>
                      </td>

                      {/* Margin % badge */}
                      <td className="py-3.5 px-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-bold inline-block",
                          calc.profitHealthStatus === 'excellent' && "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/40 dark:border-emerald-800/40",
                          calc.profitHealthStatus === 'good' && "bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200/40 dark:border-teal-800/40",
                          calc.profitHealthStatus === 'low' && "bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200/40 dark:border-amber-800/40",
                          calc.profitHealthStatus === 'loss' && "bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200/40 dark:border-rose-800/40"
                        )}>
                          {formatPercent(calc.profitMarginPercent)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={cn(
                          "text-[11px] font-bold capitalize",
                          calc.profitHealthStatus === 'excellent' && "text-emerald-600 dark:text-emerald-400",
                          calc.profitHealthStatus === 'good' && "text-teal-600 dark:text-teal-400",
                          calc.profitHealthStatus === 'low' && "text-amber-600 dark:text-amber-400",
                          calc.profitHealthStatus === 'loss' && "text-rose-600 dark:text-rose-400"
                        )}>
                          {calc.profitHealthStatus}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-400 dark:text-slate-500 text-[11px]">
                        {product.createdAt || '2024-05-18'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(product.id)}
                            title="Open in Calculator"
                            className="p-1.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleEdit(product.id)}
                            title="Edit"
                            className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => duplicateProduct(product.id)}
                            title="Duplicate"
                            className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => toggleCompareProduct(product.id)}
                            title={inComp ? "Remove from comparison" : "Add to comparison"}
                            className={cn(
                              "p-1.5 rounded-lg transition-colors",
                              inComp 
                                ? "text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/80" 
                                : "text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-800"
                            )}
                          >
                            <Columns className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => deleteProduct(product.id)}
                            title="Delete"
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing <strong className="text-slate-800 dark:text-slate-200">{Math.min(filteredProducts.length, (currentPage - 1) * itemsPerPage + 1)}</strong> to{' '}
            <strong className="text-slate-800 dark:text-slate-200">{Math.min(filteredProducts.length, currentPage * itemsPerPage)}</strong> of{' '}
            <strong className="text-slate-800 dark:text-slate-200">{filteredProducts.length}</strong> results
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "w-7 h-7 rounded-lg text-xs font-semibold transition-all",
                  currentPage === page
                    ? "bg-brand-600 text-white font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Upload CSV Modal */}
      <BulkUploadModal
        isOpen={bulkUploadModalOpen}
        onClose={() => setBulkUploadModalOpen(false)}
      />

      {/* PDF & Google Sheets Report Modal */}
      <PdfReportModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        reportType="portfolio"
      />
    </div>
  );
}
