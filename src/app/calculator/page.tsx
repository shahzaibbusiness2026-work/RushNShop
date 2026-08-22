'use client';

import React, { useState } from 'react';
import { 
  Info, 
  DollarSign, 
  Percent, 
  Megaphone, 
  CheckCircle2, 
  RotateCcw,
  Sparkles,
  Layers,
  FileText
} from 'lucide-react';
import StepProductInfo from '@/components/calculator/StepProductInfo';
import StepCosts from '@/components/calculator/StepCosts';
import StepFees from '@/components/calculator/StepFees';
import StepMarketing from '@/components/calculator/StepMarketing';
import StepReview from '@/components/calculator/StepReview';
import ProfitSummaryCard from '@/components/calculator/ProfitSummaryCard';
import ProfitHealthBadge from '@/components/calculator/ProfitHealthBadge';
import QuickActions from '@/components/calculator/QuickActions';
import ListingModal from '@/components/calculator/ListingModal';
import BulkUploadModal from '@/components/calculator/BulkUploadModal';
import PdfReportModal from '@/components/export/PdfReportModal';
import { useStore } from '@/context/StoreContext';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { FileSpreadsheet } from 'lucide-react';

export default function CalculatorPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [viewMode, setViewMode] = useState<'stepper' | 'all'>('stepper');
  const [listingModalOpen, setListingModalOpen] = useState(false);
  const [bulkUploadModalOpen, setBulkUploadModalOpen] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  const { 
    currentCalculator, 
    saveProduct, 
    duplicateProduct, 
    toggleCompareProduct, 
    resetCalculator,
    showToast 
  } = useStore();
  const router = useRouter();

  const steps = [
    { number: 1, label: 'Product Info' },
    { number: 2, label: 'Costs' },
    { number: 3, label: 'Fees' },
    { number: 4, label: 'Marketing' },
    { number: 5, label: 'Review & Result' },
  ];

  const handleSave = async () => {
    await saveProduct(currentCalculator);
  };

  const handleDuplicate = async () => {
    if (currentCalculator.id) {
      await duplicateProduct(currentCalculator.id);
    } else {
      const saved = await saveProduct(currentCalculator);
      if (saved?.id) {
        await duplicateProduct(saved.id);
      }
    }
  };

  const handleAddToComparison = async () => {
    let id = currentCalculator.id;
    if (!id) {
      const saved = await saveProduct(currentCalculator);
      id = saved.id;
    }
    if (id) {
      toggleCompareProduct(id);
      router.push('/compare');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            TikTok Profit Margin Calculator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Calculate product profitability, TikTok fees, break-even price, and target margins before launching.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Bulk Upload CSV button */}
          <button
            onClick={() => setBulkUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950 hover:bg-brand-100 dark:hover:bg-brand-900 rounded-xl transition-colors border border-brand-200/80 dark:border-brand-800/80 shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Bulk Upload CSV</span>
          </button>

          {/* Reset button */}
          <button
            onClick={resetCalculator}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          {/* Stepper vs All-in-one Toggle */}
          <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setViewMode('stepper')}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                viewMode === 'stepper'
                  ? "bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-400 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              Step Wizard
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                viewMode === 'all'
                  ? "bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-400 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              All Inputs
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form & Stepper (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Step Indicator Header (if stepper mode) */}
          {viewMode === 'stepper' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-100 dark:border-slate-800 shadow-card">
              <div className="flex items-center justify-between relative">
                {/* Step Connector Line */}
                <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-slate-100 dark:bg-slate-800 z-0" />

                {steps.map((step) => {
                  const isActive = currentStep === step.number;
                  const isCompleted = currentStep > step.number;

                  return (
                    <button
                      key={step.number}
                      onClick={() => setCurrentStep(step.number)}
                      className="relative z-10 flex flex-col items-center gap-1.5 group cursor-pointer"
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-2xs",
                          isActive
                            ? "bg-brand-600 text-white ring-4 ring-brand-100 dark:ring-brand-950"
                            : isCompleted
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                        )}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.number}
                      </div>
                      <span
                        className={cn(
                          "text-[10px] sm:text-xs font-bold transition-colors hidden sm:block",
                          isActive
                            ? "text-brand-600 dark:text-brand-400"
                            : isCompleted
                            ? "text-slate-700 dark:text-slate-300"
                            : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                        )}
                      >
                        {step.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Form Card Content */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-100 dark:border-slate-800 shadow-card">
            {viewMode === 'stepper' ? (
              <>
                {currentStep === 1 && (
                  <StepProductInfo onNext={() => setCurrentStep(2)} />
                )}
                {currentStep === 2 && (
                  <StepCosts
                    onNext={() => setCurrentStep(3)}
                    onBack={() => setCurrentStep(1)}
                  />
                )}
                {currentStep === 3 && (
                  <StepFees
                    onNext={() => setCurrentStep(4)}
                    onBack={() => setCurrentStep(2)}
                  />
                )}
                {currentStep === 4 && (
                  <StepMarketing
                    onNext={() => setCurrentStep(5)}
                    onBack={() => setCurrentStep(3)}
                  />
                )}
                {currentStep === 5 && (
                  <StepReview
                    onBack={() => setCurrentStep(4)}
                    onSave={handleSave}
                  />
                )}
              </>
            ) : (
              <div className="space-y-8 divide-y divide-slate-100">
                <StepProductInfo onNext={() => {}} />
                <div className="pt-8">
                  <StepCosts onNext={() => {}} onBack={() => {}} />
                </div>
                <div className="pt-8">
                  <StepFees onNext={() => {}} onBack={() => {}} />
                </div>
                <div className="pt-8">
                  <StepMarketing onNext={() => {}} onBack={() => {}} />
                </div>
                <div className="pt-8">
                  <StepReview onBack={() => {}} onSave={handleSave} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Summary, Health Badge & Quick Actions (5 Cols) */}
        <div className="lg:col-span-5 space-y-6 sticky top-20">
          <ProfitSummaryCard />
          <ProfitHealthBadge />
          <QuickActions
            onSave={handleSave}
            onCreateListing={() => setListingModalOpen(true)}
            onDuplicate={handleDuplicate}
            onAddToComparison={handleAddToComparison}
            onOpenPdfReport={() => setPdfModalOpen(true)}
          />
        </div>
      </div>

      {/* Listing Generator Modal */}
      <ListingModal
        isOpen={listingModalOpen}
        onClose={() => setListingModalOpen(false)}
      />

      {/* Bulk Upload CSV Modal */}
      <BulkUploadModal
        isOpen={bulkUploadModalOpen}
        onClose={() => setBulkUploadModalOpen(false)}
      />

      {/* PDF & Google Sheets Report Modal */}
      <PdfReportModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        reportType="calculator"
      />
    </div>
  );
}
