import React from 'react';
import { ProcurementRequest, Supplier } from '../../types';
import { BarChart3, TrendingUp, Sparkles, Clock, ShieldCheck, DollarSign } from 'lucide-react';

interface CompanyAnalyticsPageProps {
  requests: ProcurementRequest[];
  suppliers: Supplier[];
}

export const CompanyAnalyticsPage: React.FC<CompanyAnalyticsPageProps> = ({
  requests,
  suppliers
}) => {
  const approvedOrPaid = requests.filter(r => r.status === 'APPROVED' || r.status === 'PAID');
  const paidCount = requests.filter(r => r.status === 'PAID').length;

  const totalSpend = approvedOrPaid.reduce(
    (acc, r) => acc + (r.recommendation?.recommendedAmount || 0),
    0
  );

  const totalSavings = requests.reduce(
    (acc, r) => acc + (r.inventoryCheck?.inventorySavingsAmount || 0),
    0
  );

  const averageAOV = approvedOrPaid.length > 0
    ? Math.round(totalSpend / approvedOrPaid.length)
    : 0;

  // Real Category Breakdown
  const catMap: Record<string, number> = {};
  requests.forEach(r => {
    const cat = r.category || 'General Procurement';
    const amount = r.recommendation?.recommendedAmount || r.maxBudget;
    catMap[cat] = (catMap[cat] || 0) + amount;
  });

  const sumCategorySpend = Object.values(catMap).reduce((a, b) => a + b, 0) || 1;
  const categoriesList = Object.entries(catMap).map(([name, amount], index) => {
    const colors = ['bg-indigo-600', 'bg-blue-600', 'bg-emerald-600', 'bg-amber-600', 'bg-purple-600'];
    const pct = Math.round((amount / sumCategorySpend) * 100);
    return {
      name,
      amount,
      pct,
      color: colors[index % colors.length]
    };
  });

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Corporate Procurement & Spend Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time visibility into capital deployment, vendor cost curves, and autonomous AI savings.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total Authorized Spend</div>
          <div className="mt-1 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            ₹{totalSpend > 0 ? (totalSpend / 100000).toFixed(1) + 'L' : '₹0.0L'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across {approvedOrPaid.length} approved PRs ({paidCount} settled)</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-emerald-600 font-medium">Autonomous AI Savings</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600 font-mono tabular-nums">
            ₹{totalSavings > 0 ? (totalSavings / 100000).toFixed(1) + 'L' : '₹0.0L'}
          </div>
          <div className="text-[11px] text-emerald-700 mt-0.5">From depot inventory deduplication</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Avg. Procurement Cycle</div>
          <div className="mt-1 text-2xl font-bold text-indigo-600 font-mono tabular-nums">
            1.4 Days
          </div>
          <div className="text-[11px] text-indigo-700 mt-0.5">AI accelerated routing</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Average Order Value</div>
          <div className="mt-1 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            ₹{averageAOV > 0 ? averageAOV.toLocaleString('en-IN') : '0'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Mean transaction value</div>
        </div>
      </div>

      {/* Spend Distribution Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Spend Allocation by Category
          </h2>

          <div className="space-y-3 text-xs">
            {categoriesList.map(cat => (
              <div key={cat.name}>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span>{cat.name}</span>
                  <span className="font-mono">₹{cat.amount.toLocaleString('en-IN')} ({cat.pct}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supplier Performance Matrix */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Vendor Delivery SLA Comparison
          </h2>

          <div className="space-y-3 text-xs">
            {suppliers.map(s => (
              <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 font-mono">
                <div className="flex justify-between items-center font-sans font-bold text-slate-900">
                  <span>{s.name}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded ${
                      s.performance.riskLevel === 'LOW'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {s.performance.riskLevel} RISK
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>On-time Delivery Rate:</span>
                  <span className="text-slate-900 font-semibold">{s.performance.onTimeDeliveryRate}%</span>
                </div>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Avg. Lead Time:</span>
                  <span className="text-slate-900 font-semibold">{s.performance.averageLeadTimeDays} Days</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
