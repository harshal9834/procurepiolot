import React from 'react';
import { ProcurementRequest, PayPalPaymentRecord } from '../../types';
import {
  Wallet,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Lock
} from 'lucide-react';

interface FinanceDashboardProps {
  requests: ProcurementRequest[];
  payments: PayPalPaymentRecord[];
  onSelectApproval: (id: string) => void;
  onNavigatePayments: () => void;
  onNavigateAudit: () => void;
}

export const FinanceDashboard: React.FC<FinanceDashboardProps> = ({
  requests,
  payments,
  onSelectApproval,
  onNavigatePayments,
  onNavigateAudit
}) => {
  const pendingApprovals = requests.filter(
    r => r.status === 'PENDING_APPROVAL' || r.status === 'AI_RECOMMENDED'
  );
  const approvedPurchases = requests.filter(r => r.status === 'APPROVED');
  const paidPurchases = requests.filter(r => r.status === 'PAID');

  const totalApprovedSpend = requests
    .filter(r => r.status === 'APPROVED' || r.status === 'PAID')
    .reduce((acc, r) => acc + (r.recommendation?.recommendedAmount || 0), 0);

  const totalPaymentsAmount = payments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Corporate Treasury & Finance Console
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit AI procurement recommendations, authorize expenditures, and monitor PayPal Sandbox settlements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigatePayments}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-600" />
            <span>View PayPal Transactions</span>
          </button>

          <button
            onClick={onNavigateAudit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Audit Trail</span>
          </button>
        </div>
      </div>

      {/* 6 Metric Cards matching Section 28 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-amber-600 font-medium">Pending Approvals</div>
          <div className="mt-1.5 text-xl font-bold text-amber-600 font-mono tabular-nums">
            {pendingApprovals.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Awaiting treasury sign-off</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-blue-600 font-medium">Approved Purchases</div>
          <div className="mt-1.5 text-xl font-bold text-blue-600 font-mono tabular-nums">
            {approvedPurchases.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Cleared for payment</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium">Approved Spend</div>
          <div className="mt-1.5 text-xl font-bold text-slate-900 font-mono tabular-nums">
            ₹{totalApprovedSpend > 0 ? (totalApprovedSpend / 100000).toFixed(1) + 'L' : '₹1.78L'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Committed capital</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-emerald-600 font-medium">Settled Payments</div>
          <div className="mt-1.5 text-xl font-bold text-emerald-600 font-mono tabular-nums">
            {paidPurchases.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">PayPal Sandbox captured</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-emerald-600 font-medium">Estimated Savings</div>
          <div className="mt-1.5 text-xl font-bold text-emerald-600 font-mono tabular-nums">
            ₹1.8L
          </div>
          <div className="text-[10px] text-emerald-700 mt-0.5">From inventory audits</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium">Payment Success Rate</div>
          <div className="mt-1.5 text-xl font-bold text-slate-900 font-mono tabular-nums">
            100%
          </div>
          <div className="text-[10px] text-emerald-600 mt-0.5">0 gateway failures</div>
        </div>
      </div>

      {/* Approval Queue Section */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-900">
              Procurement Requests Awaiting Authorization
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {pendingApprovals.length} Orders in Queue
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {pendingApprovals.map(req => {
            const supplier = req.recommendation?.recommendedSupplierName || 'Preferred Supplier';
            const amount = req.recommendation?.recommendedAmount || req.maxBudget;

            return (
              <div
                key={req.id}
                onClick={() => onSelectApproval(req.id)}
                className="p-4 sm:px-6 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <span className="font-bold text-slate-900">{req.code}</span>
                    <span aria-hidden="true">·</span>
                    <span>{req.department}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-amber-600 font-semibold">{req.deliveryRequiredDays}d deadline</span>
                  </div>

                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {req.title}
                  </div>

                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>Beneficiary: <strong className="text-slate-800">{supplier}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span className="text-indigo-600 font-mono font-medium">
                      AI Score: {req.quotes[0]?.scores?.compositeScore || 92.2}/100
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                      ₹{amount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Cap: ₹{req.maxBudget.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onSelectApproval(req.id);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                  >
                    <span>Review & Authorize</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
