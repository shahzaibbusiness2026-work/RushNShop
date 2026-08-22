'use client';

import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Trash2, 
  FileText,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { ProductItem } from '@/types';
import { formatCurrency, formatPercent } from '@/lib/utils';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedProductRow {
  name: string;
  sku: string;
  category: string;
  image?: string;
  costPrice: number;
  sellingPrice: number;
  shippingCost: number;
  packagingCost: number;
  tiktokCommissionPercent: number;
  transactionFeePercent: number;
  affiliatePercent: number;
  tiktokAdsCost: number;
  creatorCost: number;
  otherMarketingCost: number;
  customExpenses: number;
  // Computed preview
  netProfit: number;
  profitMarginPercent: number;
  status: 'excellent' | 'good' | 'low' | 'loss';
  isValid: boolean;
  error?: string;
}

const SAMPLE_CSV_CONTENT = `Product Name,SKU,Category,Cost Price,Selling Price,Shipping Cost,Packaging Cost,TikTok Commission %,Affiliate %,Ad CPA,Image URL
Wireless Fast Charger 15W,WC-001,Electronics,8.50,29.99,2.00,0.80,10,5,4.00,https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=300
Sunset Projection Lamp,SL-002,Home & Living,6.20,24.99,2.50,0.50,10,8,3.50,https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300
Hydrating Face Serum 30ml,HFS-003,Beauty & Personal Care,4.10,22.50,1.80,0.60,10,12,3.00,https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300
Electric Milk Frother Handheld,EMF-004,Kitchen & Dining,3.80,18.99,2.20,0.40,10,5,2.80,https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300
MagSafe Shockproof Case,MC-005,Accessories,2.90,19.99,1.50,0.30,10,10,2.50,https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300`;

export default function BulkUploadModal({ isOpen, onClose }: BulkUploadModalProps) {
  const { settings, bulkAddProducts, showToast } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedProductRow[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');

  if (!isOpen) return null;

  const downloadSampleCsv = () => {
    const blob = new Blob([SAMPLE_CSV_CONTENT], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'rushnshop_sample_products.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Sample CSV Downloaded', 'Use this template to format your product catalog.', 'info');
  };

  const parseCsvData = (text: string) => {
    const lines = text.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length <= 1) {
      setParsedRows([]);
      return;
    }

    const headerLine = lines[0];
    const headers = headerLine.split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
    
    // Find index helpers
    const getIndex = (keys: string[]) => {
      return headers.findIndex(h => keys.some(k => h.includes(k)));
    };

    const nameIdx = getIndex(['name', 'title', 'product']);
    const skuIdx = getIndex(['sku', 'code']);
    const catIdx = getIndex(['cat', 'category']);
    const costIdx = getIndex(['cost', 'cogs', 'supplier', 'buy']);
    const sellIdx = getIndex(['sell', 'retail', 'price']);
    const shipIdx = getIndex(['ship', 'freight']);
    const packIdx = getIndex(['pack']);
    const commIdx = getIndex(['comm', 'tiktok']);
    const affIdx = getIndex(['aff', 'affiliate', 'creator']);
    const adIdx = getIndex(['ad', 'cpa', 'marketing']);
    const imgIdx = getIndex(['img', 'image', 'photo', 'url']);

    const rows: ParsedProductRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Simple CSV split (handling standard commas)
      const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));

      if (cols.length < 2) continue;

      const name = nameIdx >= 0 && cols[nameIdx] ? cols[nameIdx] : `Imported Product #${i}`;
      const sku = skuIdx >= 0 && cols[skuIdx] ? cols[skuIdx] : `SKU-IMP-${100 + i}`;
      const category = catIdx >= 0 && cols[catIdx] ? cols[catIdx] : 'General';
      const costPrice = costIdx >= 0 ? Math.max(0, parseFloat(cols[costIdx]) || 0) : 0;
      const sellingPrice = sellIdx >= 0 ? Math.max(0, parseFloat(cols[sellIdx]) || 0) : 0;
      const shippingCost = shipIdx >= 0 ? Math.max(0, parseFloat(cols[shipIdx]) || 0) : settings.defaultShippingCost;
      const packagingCost = packIdx >= 0 ? Math.max(0, parseFloat(cols[packIdx]) || 0) : settings.defaultPackagingCost;
      const tiktokCommissionPercent = commIdx >= 0 ? Math.max(0, parseFloat(cols[commIdx]) || settings.tiktokCommissionPercent) : settings.tiktokCommissionPercent;
      const transactionFeePercent = settings.transactionFeePercent;
      const affiliatePercent = affIdx >= 0 ? Math.max(0, parseFloat(cols[affIdx]) || settings.defaultAffiliatePercent) : settings.defaultAffiliatePercent;
      const tiktokAdsCost = adIdx >= 0 ? Math.max(0, parseFloat(cols[adIdx]) || 0) : 0;
      const image = imgIdx >= 0 && cols[imgIdx]?.startsWith('http') ? cols[imgIdx] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300';

      // Perform Unit Economics calculation
      const totalProductCost = costPrice + shippingCost + packagingCost;
      const totalFeePercent = tiktokCommissionPercent + transactionFeePercent + affiliatePercent;
      const feeAmount = (sellingPrice * totalFeePercent) / 100;
      const totalAllCost = totalProductCost + feeAmount + tiktokAdsCost;
      const netProfit = sellingPrice - totalAllCost;
      const profitMarginPercent = sellingPrice > 0 ? (netProfit / sellingPrice) * 100 : 0;

      let status: 'excellent' | 'good' | 'low' | 'loss' = 'good';
      if (netProfit < 0) status = 'loss';
      else if (profitMarginPercent >= 35) status = 'excellent';
      else if (profitMarginPercent >= 20) status = 'good';
      else status = 'low';

      const isValid = sellingPrice > 0 && name.trim().length > 0;

      rows.push({
        name,
        sku,
        category,
        image,
        costPrice,
        sellingPrice,
        shippingCost,
        packagingCost,
        tiktokCommissionPercent,
        transactionFeePercent,
        affiliatePercent,
        tiktokAdsCost,
        creatorCost: 0,
        otherMarketingCost: 0,
        customExpenses: 0,
        netProfit: Number(netProfit.toFixed(2)),
        profitMarginPercent: Number(profitMarginPercent.toFixed(1)),
        status,
        isValid,
        error: !isValid ? 'Selling price required' : undefined,
      });
    }

    setParsedRows(rows);
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        setCsvText(text);
        parseCsvData(text);
        showToast('CSV Loaded', `Parsed file "${file.name}".`, 'info');
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleImport = async () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      showToast('No Valid Rows', 'Please add valid products with a name and selling price.', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      await bulkAddProducts(validRows);
      onClose();
    } catch (err) {
      showToast('Import Error', 'Could not complete bulk import.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const totalEstimatedProfit = parsedRows.filter(r => r.isValid).reduce((sum, r) => sum + r.netProfit, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Bulk Upload Products (CSV / Excel)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Import multiple TikTok products with automated profit calculations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadSampleCsv}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors border border-slate-200/60 dark:border-slate-700/60"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Template</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          
          {/* Mode Switcher */}
          <div className="flex items-center justify-between">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'upload'
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload CSV File</span>
              </button>
              <button
                onClick={() => setActiveTab('paste')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'paste'
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Paste CSV Data</span>
              </button>
            </div>

            <button
              onClick={downloadSampleCsv}
              className="sm:hidden text-xs text-brand-600 font-semibold flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span>Sample CSV</span>
            </button>
          </div>

          {/* Upload Dropzone */}
          {activeTab === 'upload' ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                isDragging 
                  ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40' 
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:border-brand-400 dark:hover:border-brand-600'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .txt, .tsv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-3 shadow-xs">
                <Upload className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Click to browse or drag & drop CSV file
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Upload your product spreadsheet with columns for Cost, Selling Price, and TikTok fees.
              </p>
            </div>
          ) : (
            <div>
              <textarea
                rows={5}
                value={csvText}
                onChange={(e) => {
                  setCsvText(e.target.value);
                  parseCsvData(e.target.value);
                }}
                placeholder={SAMPLE_CSV_CONTENT}
                className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Preview & Economics ({validCount} Valid Products)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-200/60 dark:border-emerald-800">
                    Est. Total Profit: {formatCurrency(totalEstimatedProfit, settings.currencySymbol)}
                  </span>
                </div>
                <button
                  onClick={() => { setParsedRows([]); setCsvText(''); }}
                  className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-semibold sticky top-0">
                      <tr>
                        <th className="p-3">Product</th>
                        <th className="p-3">Category</th>
                        <th className="p-3 text-right">Cost</th>
                        <th className="p-3 text-right">Selling Price</th>
                        <th className="p-3 text-right">Net Profit</th>
                        <th className="p-3 text-right">Margin %</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {parsedRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            {row.image && (
                              <img src={row.image} alt={row.name} className="w-6 h-6 rounded-md object-cover" />
                            )}
                            <div className="min-w-0">
                              <span className="truncate block max-w-[150px]">{row.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{row.sku}</span>
                            </div>
                          </td>
                          <td className="p-3 text-slate-500 dark:text-slate-400">{row.category}</td>
                          <td className="p-3 text-right font-mono">{formatCurrency(row.costPrice, settings.currencySymbol)}</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                            {formatCurrency(row.sellingPrice, settings.currencySymbol)}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(row.netProfit, settings.currencySymbol)}
                          </td>
                          <td className="p-3 text-right font-mono font-bold">
                            {row.profitMarginPercent}%
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              row.status === 'excellent' 
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300' 
                                : row.status === 'good'
                                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
                                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {parsedRows.length === 0 ? 'Upload or paste CSV to preview' : `${validCount} ready to import`}
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={validCount === 0 || isProcessing}
              onClick={handleImport}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all flex items-center gap-2"
            >
              <span>{isProcessing ? 'Importing...' : `Import ${validCount} Products`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
