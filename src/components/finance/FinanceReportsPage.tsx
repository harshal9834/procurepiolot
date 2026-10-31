import React from 'react';
import { ProcurementRequest, Supplier } from '../../types';
import { BarChart3, TrendingUp, DollarSign, CheckCircle2, XCircle } from 'lucide-react';

interface FinanceReportsPageProps {
  requests: ProcurementRequest[];
  suppliers: Supplier[];
}

export const FinanceReportsPage: React.FC<FinanceReportsPageProps> = ({
  requests,
  suppliers
}) => {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Treasury & Financial Reports
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Comprehensive compliance reports for corporate governance, vendor concentration, and budget variances.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Approved Spend Rate</div>
          <div className="mt-1 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            92.8%
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Within fiscal tolerance</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Rejection / Renegotiation</div>
          <div className="mt-1 text-2xl font-bold text-amber-600 font-mono tabular-nums">
            7.2%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Delivery or price variance</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Capital Saved via Depot Reuse</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600 font-mono tabular-nums">
            ₹77,000
          </div>
          <div className="text-[11px] text-emerald-700 mt-0.5">PR-2026-00001 chair deduction</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">PayPal Settlement SLA</div>
          <div className="mt-1 text-2xl font-bold text-indigo-600 font-mono tabular-nums">
            &lt; 3 mins
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Sandbox capture latency</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Supplier Spend Concentration
        </h2>

        <div className="space-y-3 font-mono text-xs">
          {suppliers.map(s => (
            <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-sans font-bold text-slate-900">{s.name}</span>
                <span className="text-slate-400 font-normal ml-2">({s.categories.join(', ')})</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900">₹{(s.performance.totalSpend / 100000).toFixed(1)}L</span>
                <span className="text-[11px] text-slate-400 ml-2">({s.performance.totalOrdersCompleted} POs)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
