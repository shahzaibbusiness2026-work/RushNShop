'use client';

import React, { useRef, useState } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Tag, 
  Hash, 
  Package, 
  X, 
  FolderOpen, 
  Sparkles,
  Link as LinkIcon,
  Check
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

interface StepProductInfoProps {
  onNext: () => void;
}

const CATEGORIES = [
  'Electronics',
  'Home & Living',
  'Beauty & Personal Care',
  'Fashion & Apparel',
  'Kitchen & Dining',
  'Health & Fitness',
  'Automotive & Tools',
  'Toys & Hobbies',
  'Accessories',
];

const PRESET_IMAGES = [
  { name: 'Wireless Charger', category: 'Electronics', url: 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=400&auto=format&fit=crop&q=80' },
  { name: 'Smart Watch', category: 'Electronics', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80' },
  { name: 'LED Sunset Lamp', category: 'Home & Living', url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&auto=format&fit=crop&q=80' },
  { name: 'Phone Case MagSafe', category: 'Accessories', url: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&auto=format&fit=crop&q=80' },
  { name: 'Noise-Canceling Earbuds', category: 'Electronics', url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&auto=format&fit=crop&q=80' },
  { name: 'Hydrating Face Serum', category: 'Beauty & Personal Care', url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&auto=format&fit=crop&q=80' },
  { name: 'Electric Milk Frother', category: 'Kitchen & Dining', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80' },
  { name: 'Fitness Resistance Bands', category: 'Health & Fitness', url: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&auto=format&fit=crop&q=80' },
];

export default function StepProductInfo({ onNext }: StepProductInfoProps) {
  const { currentCalculator, updateCalculator, showToast } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState<'upload' | 'gallery' | 'url'>('upload');

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Invalid File Type', 'Please upload a valid image file (JPG, PNG, WebP).', 'error');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showToast('File Too Large', 'Please upload an image smaller than 8MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        updateCalculator({ image: dataUrl });
        showToast('Image Attached', `Loaded "${file.name}" from your device gallery.`, 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleImagePreset = (preset: typeof PRESET_IMAGES[0]) => {
    updateCalculator({ 
      image: preset.url,
      // If name is empty, auto-suggest preset name and category
      name: currentCalculator.name || preset.name,
      category: currentCalculator.category || preset.category,
    });
    showToast('Gallery Image Selected', `Applied preset "${preset.name}".`, 'info');
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateCalculator({ image: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    showToast('Image Removed', 'Product mockup reset.', 'info');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Product Information</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enter basic details about your product for TikTok Shop.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Product Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            Product Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Wireless Charger Fast 15W"
            value={currentCalculator.name || ''}
            onChange={(e) => updateCalculator({ name: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
          />
        </div>

        {/* SKU */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            SKU / Product Code
          </label>
          <input
            type="text"
            placeholder="e.g. WC-001"
            value={currentCalculator.sku || ''}
            onChange={(e) => updateCalculator({ sku: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors uppercase font-mono"
          />
        </div>
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          Category (Optional)
        </label>
        <select
          value={currentCalculator.category || 'Electronics'}
          onChange={(e) => updateCalculator({ category: e.target.value })}
          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors cursor-pointer"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Product Image Upload & Media Gallery Suite */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            Product Photo / Mockup
          </label>

          {/* Media Tab Pill Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-semibold border border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => setActiveMediaTab('upload')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                activeMediaTab === 'upload'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Upload className="w-3 h-3" />
              <span>Upload File</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMediaTab('gallery')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                activeMediaTab === 'gallery'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Preset Gallery</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMediaTab('url')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                activeMediaTab === 'url'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <LinkIcon className="w-3 h-3" />
              <span>Image URL</span>
            </button>
          </div>
        </div>

        {/* Hidden native file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
          {/* Main Image Preview & Drop Box */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`sm:col-span-5 h-44 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center relative overflow-hidden cursor-pointer transition-all ${
              isDragging 
                ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 ring-4 ring-brand-500/20' 
                : currentCalculator.image 
                  ? 'border-slate-200 dark:border-slate-700 bg-slate-900/5 dark:bg-slate-800/40' 
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-brand-400 dark:hover:border-brand-600'
            }`}
          >
            {currentCalculator.image ? (
              <div className="relative w-full h-full group">
                <img
                  src={currentCalculator.image}
                  alt="Product preview"
                  className="w-full h-full object-contain rounded-xl"
                />
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex flex-col items-center justify-center gap-2 p-2">
                  <span className="text-white text-xs font-semibold flex items-center gap-1">
                    <FolderOpen className="w-3.5 h-3.5" />
                    Change Photo
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold shadow-xs flex items-center gap-1 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center p-2">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-2 shadow-2xs">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Upload from Device / Gallery
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Click to browse or drag & drop image
                </span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
                  PNG, JPG, WebP up to 8MB
                </span>
              </div>
            )}
          </div>

          {/* Tab Content Side Panel */}
          <div className="sm:col-span-7 space-y-3">
            {activeMediaTab === 'upload' && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/70 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <FolderOpen className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                    Device Gallery Upload
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Select a product mockup, supplier screenshot (AliExpress/CJ Dropshipping), or TikTok product photo from your local files.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose File from Gallery</span>
                  </button>
                  {currentCalculator.image && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
                    >
                      Clear Photo
                    </button>
                  )}
                </div>
              </div>
            )}

            {activeMediaTab === 'gallery' && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/70 dark:border-slate-800 space-y-2.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  TikTok Winning Product Presets:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_IMAGES.map((preset, idx) => {
                    const isSelected = currentCalculator.image === preset.url;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleImagePreset(preset)}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group ${
                          isSelected
                            ? 'border-brand-600 ring-2 ring-brand-500/30'
                            : 'border-slate-200 dark:border-slate-700 hover:border-brand-400 opacity-75 hover:opacity-100'
                        }`}
                        title={`${preset.name} (${preset.category})`}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 bg-brand-600 text-white rounded-full flex items-center justify-center shadow-xs">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeMediaTab === 'url' && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/70 dark:border-slate-800 space-y-2.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Paste External Image URL:
                </span>
                <input
                  type="url"
                  placeholder="https://example.com/product-image.jpg"
                  value={currentCalculator.image || ''}
                  onChange={(e) => updateCalculator({ image: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <p className="text-[10px] text-slate-400">
                  Accepts direct links from Shopify, Amazon, CJ Dropshipping, or supplier CDNs.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Next Step CTA */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 group"
        >
          <span>Next Step (Costs)</span>
          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </button>
      </div>
    </div>
  );
}
