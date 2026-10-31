import React from 'react';
import { ProcurementRequest, UserRole } from '../types';
import {
  TrendingUp,
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
  PlusCircle,
  FileText
} from 'lucide-react';

interface DashboardViewProps {
  requests: ProcurementRequest[];
  onSelectRequest: (id: string) => void;
  onOpenCreateModal: () => void;
  currentRole: UserRole;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  requests,
  onSelectRequest,
  onOpenCreateModal,
  currentRole
}) => {
  const primaryPR = requests.find(r => r.code === 'PR-2026-00124') || requests[0];

  return (
    <div className="space-y-8 py-6">
      {/* Top Banner with Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Procurement Intelligence Center
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Autonomous decision engine evaluating total cost, inventory overlap, and supplier risk.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Request</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Spend (YTD)</span>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            ₹12.4L
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Across 42 purchase orders
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 text-xs font-medium">
            <span>AI Verified Savings</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 font-mono tabular-nums">
            ₹1.8L
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Inventory & TCO optimization
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Active Requests</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {requests.length > 0 ? requests.length + 22 : 23}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            4 awaiting quotes
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 text-xs font-medium">
            <span>Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600 font-mono tabular-nums">
            7
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Finance review required
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-indigo-600 text-xs font-medium">
            <span>Decision Confidence</span>
            <Sparkles className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-indigo-600 font-mono tabular-nums">
            92%
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Empirical multi-factor model
          </div>
        </div>
      </div>

      {/* Featured Scenario Card */}
      {primaryPR && (
        <div className="p-6 bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl shadow-sm border border-slate-700">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-3 text-xs text-slate-300 font-mono">
                <span className="text-indigo-300 font-semibold">{primaryPR.code}</span>
                <span aria-hidden="true">·</span>
                <span>{primaryPR.department}</span>
                <span aria-hidden="true">·</span>
                <span className="uppercase tracking-wider text-amber-400">
                  {primaryPR.status.replace('_', ' ')}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {primaryPR.title}
              </h2>

              <p className="text-sm text-slate-300 line-clamp-2">
                {primaryPR.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                <div>
                  <span className="text-slate-400">Requested:</span>{' '}
                  <span className="font-semibold text-white font-mono tabular-nums">
                    {primaryPR.requestedQuantity} Units
                  </span>
                </div>
                <div aria-hidden="true">·</div>
                <div>
                  <span className="text-slate-400">Budget:</span>{' '}
                  <span className="font-semibold text-white font-mono tabular-nums">
                    ₹{primaryPR.maxBudget.toLocaleString('en-IN')}
                  </span>
                </div>
                <div aria-hidden="true">·</div>
                <div>
                  <span className="text-slate-400">Inventory Stock:</span>{' '}
                  <span className="font-semibold text-emerald-400 font-mono tabular-nums">
                    {primaryPR.inventoryCheck?.existingStock || 35} Units Available
                  </span>
                </div>
                <div aria-hidden="true">·</div>
                <div>
                  <span className="text-slate-400">Net Recommendation:</span>{' '}
                  <span className="font-semibold text-indigo-300 font-mono tabular-nums">
                    Buy {primaryPR.recommendation?.recommendedQuantity || 65} Units
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <button
                onClick={() => onSelectRequest(primaryPR.id)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-900 bg-white rounded-lg hover:bg-slate-100 transition-colors shadow-xs"
              >
                <span>Open Decision Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center text-xs text-slate-400">
                {primaryPR.quotes?.length || 3} Quotations Analyzed
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Requests Table + Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table of Requests */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">
              Recent Procurement Orders
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Live Pipeline
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {requests.map(req => {
              const isPaid = req.status === 'PAID';
              const isApproved = req.status === 'APPROVED';

              return (
                <div
                  key={req.id}
                  onClick={() => onSelectRequest(req.id)}
                  className="p-4 sm:px-6 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                      <span className="font-semibold text-slate-900">{req.code}</span>
                      <span aria-hidden="true">·</span>
                      <span>{req.department}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-400">{req.deliveryRequiredDays}d deadline</span>
                    </div>

                    <div className="mt-1 text-sm font-semibold text-slate-900 truncate">
                      {req.title}
                    </div>

                    <div className="mt-1 text-xs text-slate-500 flex items-center gap-2">
                      <span>Target: {req.requestedQuantity} units</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">Budget: ₹{req.maxBudget.toLocaleString('en-IN')}</span>
                      {req.recommendation && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-indigo-600 font-medium">
                            AI: {req.recommendation.decision} ({req.recommendation.recommendedQuantity} units)
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isApproved
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {req.status.replace('_', ' ')}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Supplier & Risk Breakdown Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-base font-semibold text-slate-900 mb-4">
              Vendor Risk Distribution
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Low Risk (Verified)</span>
                  <span className="font-mono">64% (28 suppliers)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '64%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Medium Risk (Lead-time volatility)</span>
                  <span className="font-mono">24% (11 suppliers)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '24%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>High Risk (Advance wire / Delayed)</span>
                  <span className="font-mono">12% (5 suppliers)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '12%' }} />
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500 leading-relaxed">
              ProcurePilot audits every quote against delivery deadlines, advance payment constraints, and historical defect rates before approving financial clearance.
            </div>
          </div>

          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-5 shadow-xs">
            <h4 className="text-sm font-semibold text-indigo-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Core Procurement Principle</span>
            </h4>
            <p className="mt-2 text-xs text-indigo-900/80 leading-relaxed">
              ProcurePilot does not simply rank vendors by lowest nominal price. It examines existing inventory first, quantifies Total Cost of Ownership (assembly, freight, failure risks), and strictly gates financial disbursement through PayPal Sandbox.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
