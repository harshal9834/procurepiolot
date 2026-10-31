import React from 'react';
import { ProcurementRequest } from '../../types';
import { PlusCircle, FileText, Clock, Sparkles, CheckCircle2, ArrowRight, Wallet, AlertCircle } from 'lucide-react';

interface RequesterDashboardProps {
  requests: ProcurementRequest[];
  onCreateNew: () => void;
  onSelectRequest: (id: string) => void;
}

export const RequesterDashboard: React.FC<RequesterDashboardProps> = ({
  requests,
  onCreateNew,
  onSelectRequest
}) => {
  // Compute metric cards strictly from real database items (Section 6)
  const totalMyRequests = requests.length;
  const waitingForQuotes = requests.filter(r =>
    r.status === 'REQUEST_SENT' || r.status === 'QUOTES_RECEIVING' || r.status === 'DRAFT'
  ).length;
  const aiRecommendationsReady = requests.filter(r =>
    r.status === 'AI_RECOMMENDED' || r.status === 'ANALYZED'
  ).length;
  const awaitingRequesterApproval = requests.filter(r =>
    r.status === 'AI_RECOMMENDED' || r.status === 'AWAITING_REQUESTER_APPROVAL' || r.status === 'PENDING_APPROVAL'
  ).length;
  const sentToFinance = requests.filter(r =>
    r.status === 'AWAITING_FINANCE' || r.status === 'APPROVED' || r.status === 'PAYMENT_PENDING'
  ).length;
  const paidCount = requests.filter(r => r.status === 'PAID').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">DRAFT</span>;
      case 'REQUEST_SENT':
      case 'QUOTES_RECEIVING':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">WAITING FOR QUOTES</span>;
      case 'AI_RECOMMENDED':
      case 'AWAITING_REQUESTER_APPROVAL':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse">AI RECOMMENDED</span>;
      case 'AWAITING_FINANCE':
      case 'APPROVED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">SENT TO FINANCE</span>;
      case 'PAYMENT_PENDING':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">PAYMENT PENDING</span>;
      case 'PAID':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">PAID & SETTLED</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 py-1">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Requester Operations Hub</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create requirements, receive supplier quotations, review AI supplier rankings, and dispatch approved POs to Finance.
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Procurement Request</span>
        </button>
      </div>

      {/* 6 Metric Cards matching Section 6 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium">My Requests</div>
          <div className="mt-1.5 text-xl font-bold text-slate-900 font-mono tabular-nums">{totalMyRequests}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Total initiated</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-amber-600 font-medium">Waiting for Quotes</div>
          <div className="mt-1.5 text-xl font-bold text-amber-600 font-mono tabular-nums">{waitingForQuotes}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Supplier bids pending</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-indigo-600 font-medium">AI Recommendations</div>
          <div className="mt-1.5 text-xl font-bold text-indigo-600 font-mono tabular-nums">{aiRecommendationsReady}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Ready for review</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-blue-600 font-medium">Awaiting Approval</div>
          <div className="mt-1.5 text-xl font-bold text-blue-600 font-mono tabular-nums">{awaitingRequesterApproval}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Requires your decision</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-purple-600 font-medium">Sent to Finance</div>
          <div className="mt-1.5 text-xl font-bold text-purple-600 font-mono tabular-nums">{sentToFinance}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Pending PayPal payout</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-emerald-600 font-medium">Paid</div>
          <div className="mt-1.5 text-xl font-bold text-emerald-600 font-mono tabular-nums">{paidCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">PayPal confirmed</div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Procurement Requirements Pipeline</h2>
            <p className="text-xs text-slate-500">
              Live lifecycle of all procurement requests with active quotes and AI recommendations.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">{requests.length} Requests</span>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-semibold text-slate-700">No procurement requests yet</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Start by telling the system what you need. AI will help you request competitive supplier quotations.
            </p>
            <button
              onClick={onCreateNew}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
            >
              Create First Request
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map(r => {
              const quoteCount = r.quotes?.length || 0;
              const hasRecommendation = Boolean(r.recommendation?.recommendedSupplierName);
              const recAmount = r.approval?.approvedAmount || r.recommendation?.recommendedAmount || r.maxBudget;

              return (
                <div
                  key={r.id}
                  onClick={() => onSelectRequest(r.id)}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer bg-white space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-indigo-600">{r.code}</span>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {r.productService || r.title}
                      </h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {r.requestedQuantity} {r.unit} · Delivery within {r.deliveryRequiredDays} days
                      </div>
                    </div>
                    <div>{getStatusBadge(r.status)}</div>
                  </div>

                  {/* Summary row */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-sans block">Quotes</span>
                      <span className="font-bold text-slate-800">{quoteCount} Received</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-sans block">
                        {hasRecommendation ? 'AI Recommended' : 'Estimated Budget'}
                      </span>
                      <span className="font-bold text-slate-900">₹{recAmount.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-sans block">Target Supplier</span>
                      <span className="font-bold text-indigo-700 truncate max-w-[120px] block font-sans">
                        {r.recommendation?.recommendedSupplierName || (r.targetSupplierMode === 'ALL_RELEVANT' ? 'All Relevant' : 'Specific')}
                      </span>
                    </div>
                  </div>

                  {/* Action Link */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-[11px] text-slate-400">Created {new Date(r.createdAt).toLocaleDateString()}</span>
                    <span className="text-indigo-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>View Quotes & AI Recommendation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
