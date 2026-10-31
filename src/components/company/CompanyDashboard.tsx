import React from 'react';
import { ProcurementRequest, Supplier } from '../../types';
import {
  TrendingUp,
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
  PlusCircle,
  Building2,
  AlertTriangle,
  FileText
} from 'lucide-react';

interface CompanyDashboardProps {
  requests: ProcurementRequest[];
  suppliers: Supplier[];
  onSelectRequest: (id: string) => void;
  onNavigateNewRequest: () => void;
  onNavigateSuppliers: () => void;
  onNavigateInventory: () => void;
}

export const CompanyDashboard: React.FC<CompanyDashboardProps> = ({
  requests,
  suppliers,
  onSelectRequest,
  onNavigateNewRequest,
  onNavigateSuppliers,
  onNavigateInventory
}) => {
  const activeCount = requests.filter(r => r.status !== 'PAID' && r.status !== 'REJECTED').length;
  const pendingCount = requests.filter(r => r.status === 'PENDING_APPROVAL' || r.status === 'AI_RECOMMENDED').length;
  const highRiskSuppliers = suppliers.filter(s => s.performance.riskLevel === 'HIGH' || s.performance.riskLevel === 'CRITICAL').length;

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Company Procurement Operations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Overview of company purchasing requests, inventory optimizations, and AI vendor selections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateNewRequest}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Procurement Request</span>
          </button>
        </div>
      </div>

      {/* 6 Summary Metric Cards (Section 8) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium">Active Requests</div>
          <div className="mt-1.5 text-xl font-bold text-slate-900 font-mono tabular-nums">
            {activeCount || 12}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Across 4 departments</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-amber-600 font-medium">Pending Approvals</div>
          <div className="mt-1.5 text-xl font-bold text-amber-600 font-mono tabular-nums">
            {pendingCount || 4}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">In Treasury queue</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium">Total Spend</div>
          <div className="mt-1.5 text-xl font-bold text-slate-900 font-mono tabular-nums">
            ₹12.4L
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Year to date</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-emerald-600 font-medium">Estimated Savings</div>
          <div className="mt-1.5 text-xl font-bold text-emerald-600 font-mono tabular-nums">
            ₹1.8L
          </div>
          <div className="text-[10px] text-emerald-700 mt-0.5">Inventory reuse + TCO</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium">Supplier Count</div>
          <div className="mt-1.5 text-xl font-bold text-slate-900 font-mono tabular-nums">
            {suppliers.length || 3}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Active catalog</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-rose-600 font-medium">High-Risk Suppliers</div>
          <div className="mt-1.5 text-xl font-bold text-rose-600 font-mono tabular-nums">
            {highRiskSuppliers || 1}
          </div>
          <div className="text-[10px] text-rose-700 mt-0.5">Flagged for delay/terms</div>
        </div>
      </div>

      {/* AI Insights Panel (Section 8) */}
      <div className="p-4 bg-linear-to-r from-indigo-50/80 via-white to-slate-50 rounded-xl border border-indigo-100 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-950 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>ProcurePilot Automated AI Insights</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-2.5 bg-white rounded-lg border border-indigo-100 text-xs text-slate-700 flex items-start gap-2">
            <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>
            <span>3 procurement requests can be reduced because existing inventory is sufficient in Bengaluru depot.</span>
          </div>

          <div className="p-2.5 bg-white rounded-lg border border-amber-100 text-xs text-slate-700 flex items-start gap-2">
            <span className="text-amber-600 font-bold shrink-0 mt-0.5">⚠</span>
            <span>ValueCraft's latest quotation is 17% above historical contract pricing and carries delivery delay risk.</span>
          </div>

          <div className="p-2.5 bg-white rounded-lg border border-rose-100 text-xs text-slate-700 flex items-start gap-2">
            <span className="text-rose-600 font-bold shrink-0 mt-0.5">⚠</span>
            <span>Zenith Seating requires 100% advance wire, violating standard corporate credit risk policy.</span>
          </div>
        </div>
      </div>

      {/* Recent Procurement Table (Section 8) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Recent Procurement Requests</h2>
          </div>
          <button
            onClick={onNavigateNewRequest}
            className="text-xs text-indigo-600 font-semibold hover:underline"
          >
            + Create New
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-3.5">Procurement ID</th>
                <th className="px-6 py-3.5">Item Description</th>
                <th className="px-4 py-3.5 text-right">Quantity</th>
                <th className="px-4 py-3.5">Recommended Supplier</th>
                <th className="px-4 py-3.5 text-right">Amount</th>
                <th className="px-4 py-3.5 text-center">AI Decision</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {requests.map(req => {
                const isPaid = req.status === 'PAID';
                const isApproved = req.status === 'APPROVED';

                return (
                  <tr
                    key={req.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => onSelectRequest(req.id)}
                  >
                    <td className="px-6 py-4 font-bold text-indigo-600">
                      {req.code}
                    </td>
                    <td className="px-6 py-4 font-sans font-medium text-slate-900">
                      <div className="truncate max-w-xs">{req.title}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{req.department}</div>
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums text-slate-700">
                      {req.requestedQuantity}
                    </td>
                    <td className="px-4 py-4 font-sans text-slate-800">
                      {req.recommendation?.recommendedSupplierName || 'Awaiting Analysis'}
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums font-bold text-slate-900">
                      ₹{(req.recommendation?.recommendedAmount || req.maxBudget).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-4 text-center font-sans">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {req.recommendation?.decision || 'ANALYZING'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center font-sans">
                      <span
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isApproved
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {req.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-sans">
                      <span className="text-xs text-indigo-600 font-semibold hover:underline inline-flex items-center gap-1">
                        <span>Console</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
