'use client';

import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  X, 
  Send, 
  TrendingUp, 
  AlertCircle, 
  Zap, 
  ArrowRight,
  DollarSign,
  Percent,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatCurrency, formatPercent, cn } from '@/lib/utils';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  recommendations?: {
    action: string;
    impact: string;
    recommendedValue?: number;
  }[];
  timestamp: string;
}

export default function AiAssistantDrawer() {
  const { 
    aiDrawerOpen, 
    setAiDrawerOpen, 
    products, 
    currentCalculator, 
    currentCalculation, 
    settings,
    updateCalculator,
    showToast
  } = useStore();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `Hello Alex! I am your **RushNshop Profit Intelligence Advisor**. I continuously analyze your TikTok Shop economics, ad spend limits, and competitor margins.\n\nCurrently, your average margin is **34.2%** across ${products.length} analyzed products. How can I help you optimize today?`,
      timestamp: 'Just now',
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);

  if (!aiDrawerOpen) return null;

  const quickPrompts = [
    'How do I increase margins on my active product?',
    'What is my maximum affordable TikTok ad CPA?',
    'Simulate 12% TikTok fee increase on profits',
    'Which of my saved products should I scale?'
  ];

  const handleSend = (textToSend?: string) => {
    const queryText = textToSend || input;
    if (!queryText.trim()) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: 'Just now',
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsThinking(true);

    setTimeout(() => {
      let aiReplyText = '';
      let recommendations: Message['recommendations'] = undefined;

      const lower = queryText.toLowerCase();

      if (lower.includes('margin') || lower.includes('increase') || lower.includes('improve')) {
        const targetPrice = currentCalculation.recommendedSellingPrice;
        const currentPrice = Number(currentCalculator.sellingPrice) || 29.99;
        const diff = targetPrice - currentPrice;
        
        aiReplyText = `Here is your profitability breakdown for **${currentCalculator.name || 'Current Product'}**:\n\n` +
          `• Current Selling Price: **${formatCurrency(currentPrice)}**\n` +
          `• Current Net Profit: **${formatCurrency(currentCalculation.netProfit)}** (${formatPercent(currentCalculation.profitMarginPercent)})\n` +
          `• Target Target Margin: **${settings.targetProfitMarginPercent}%**\n\n` +
          `**Actionable Opportunities:**\n` +
          `1. **Price Optimization**: Increase price by **${formatCurrency(Math.max(0, diff))}** to reach ${formatCurrency(targetPrice)}. This elevates margin to ${settings.targetProfitMarginPercent}% without hurting TikTok conversion if paired with a coupon badge.\n` +
          `2. **Supplier Packaging**: Packaging is currently ${formatCurrency(Number(currentCalculator.packagingCost) || 1)}. Bulk poly-mailers can shave $0.40/unit.\n` +
          `3. **Creator Commission**: At 5% affiliate rate, ensure top creators produce at least 2 spark ads per month to maximize ROAS.`;
        
        recommendations = [
          {
            action: `Set Selling Price to ${formatCurrency(targetPrice)}`,
            impact: `Increases margin to ${settings.targetProfitMarginPercent}%`,
            recommendedValue: Number(targetPrice.toFixed(2))
          }
        ];
      } else if (lower.includes('cpa') || lower.includes('ad') || lower.includes('affordable')) {
        const maxCpa = currentCalculation.maxAffordableAdCost;
        aiReplyText = `Based on your cost structure ($${(currentCalculation.productCostTotal + currentCalculation.tiktokFeesTotal).toFixed(2)} total product + platform fees):\n\n` +
          `• **Maximum Break-Even Ad CPA**: **${formatCurrency(currentCalculation.netProfit + Number(currentCalculator.tiktokAdsCost || 0))}** (Zero profit threshold)\n` +
          `• **Safe Target Ad CPA**: **${formatCurrency(maxCpa)}** (Guarantees your minimum $${settings.minimumAcceptableProfit.toFixed(2)} profit/order)\n\n` +
          `💡 **TikTok Ads Strategy**: Set your TikTok Spark Ad target CPA bid to **${formatCurrency(maxCpa * 0.85)}** to ensure consistent positive ROAS on TikTok Shop.`;
      } else if (lower.includes('fee') || lower.includes('simulate') || lower.includes('12%')) {
        const price = Number(currentCalculator.sellingPrice) || 29.99;
        const currentFee = currentCalculation.tiktokFeesTotal;
        const simulatedFeePercent = 12 + settings.transactionFeePercent + settings.defaultAffiliatePercent;
        const simulatedFee = (price * simulatedFeePercent) / 100;
        const diff = simulatedFee - currentFee;
        const simulatedMargin = ((currentCalculation.netProfit - diff) / price) * 100;

        aiReplyText = `**Simulation: TikTok Commission increases to 12%**\n\n` +
          `• Current TikTok Total Fees: **${formatCurrency(currentFee)}** (${currentCalculation.tiktokFeesPercentTotal}%)\n` +
          `• Simulated Total Fees: **${formatCurrency(simulatedFee)}** (${simulatedFeePercent}%)\n` +
          `• Profit Impact: Net profit drops by **-${formatCurrency(diff)}** per unit\n` +
          `• New Profit Margin: **${formatPercent(simulatedMargin)}** (Down from ${formatPercent(currentCalculation.profitMarginPercent)})\n\n` +
          `💡 **Mitigation Recommendation**: Adjust retail price from ${formatCurrency(price)} to **${formatCurrency(price + diff)}** to fully offset the fee hike.`;
      } else if (lower.includes('scale') || lower.includes('which') || lower.includes('saved')) {
        const topProd = products.find(p => p.status === 'excellent') || products[0];
        aiReplyText = `**Top Scale Recommendation: ${topProd.name}**\n\n` +
          `• SKU: **${topProd.sku}**\n` +
          `• Selling Price: **${formatCurrency(topProd.sellingPrice)}**\n` +
          `• Net Profit per Sale: **${formatCurrency(topProd.sellingPrice - (topProd.costPrice + topProd.shippingCost + topProd.packagingCost + (topProd.sellingPrice * 0.17) + topProd.tiktokAdsCost))}**\n` +
          `• Profit Status: **Excellent / Winner 🏆**\n\n` +
          `This product has the best cost-to-margin ratio. Increase TikTok Spark Ad budget by 20% week-over-week while monitor CAC daily.`;
      } else {
        aiReplyText = `I have analyzed your query regarding "${queryText}".\n\n` +
          `Based on your current catalog metrics:\n` +
          `• Total Products: ${products.length}\n` +
          `• Store Default Margin Target: ${settings.targetProfitMarginPercent}%\n` +
          `• Highest Margin Category: Electronics (Avg 38.5%)\n\n` +
          `Let me know if you would like me to calculate break-even pricing, generate listing copy, or adjust ad budgets for any specific item!`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: aiReplyText,
          recommendations,
          timestamp: 'Just now',
        }
      ]);
      setIsThinking(false);
    }, 600);
  };

  const handleApplyRec = (rec: { action: string; recommendedValue?: number }) => {
    if (rec.recommendedValue !== undefined) {
      updateCalculator({ sellingPrice: rec.recommendedValue });
      showToast('Price Applied', `Updated calculator selling price to ${formatCurrency(rec.recommendedValue)}.`, 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setAiDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-100 dark:border-slate-800">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-brand-600 to-indigo-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm flex items-center gap-1.5">
                  RushNshop AI Advisor
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </h3>
                <p className="text-[11px] text-white/80">TikTok Profit & Pricing Intelligence</p>
              </div>
            </div>

            <button
              onClick={() => setAiDrawerOpen(false)}
              className="p-1.5 rounded-xl hover:bg-white/20 text-white/90 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick status bar */}
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Analyzing: <strong className="text-slate-900 dark:text-white">{currentCalculator.name || 'Wireless Charger'}</strong></span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200/40 dark:border-emerald-800/40">
              {formatPercent(currentCalculation.profitMarginPercent)} Margin
            </span>
          </div>

          {/* Messages body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3",
                  msg.sender === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed",
                    msg.sender === 'user'
                      ? "bg-brand-600 text-white rounded-br-xs shadow-xs"
                      : "bg-slate-50 dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-xs shadow-2xs whitespace-pre-line"
                  )}
                >
                  <div>{msg.text}</div>

                  {/* Action recommendation button */}
                  {msg.recommendations && msg.recommendations.map((rec, i) => (
                    <div key={i} className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-700">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{rec.action}</p>
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-400">{rec.impact}</p>
                        </div>
                        <button
                          onClick={() => handleApplyRec(rec)}
                          className="px-2.5 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold text-[11px] transition-colors flex items-center gap-1 shrink-0"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Apply
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex gap-3 items-center text-slate-400 text-xs">
                <div className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="w-1.5 h-1.5 bg-brand-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-brand-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-brand-600 rounded-full animate-bounce" />
                  <span className="ml-1 text-slate-500 dark:text-slate-400 font-medium">Analyzing TikTok metrics...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts Chips */}
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
              Quick Inquiries
            </div>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-slate-700 hover:text-brand-700 dark:hover:text-brand-300 text-slate-600 dark:text-slate-300 text-[11px] font-medium transition-colors text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <div className="p-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask about margins, ad ROAS, TikTok fees..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={!input.trim() || isThinking}
                className="p-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl transition-colors shadow-2xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
