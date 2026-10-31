import React from 'react';
import { ProcurementRequest, PayPalPaymentRecord } from '../../types';
import { Wallet, CheckCircle2, Clock, ArrowRight, ShieldCheck, DollarSign, UserCheck, Sparkles, Building2 } from 'lucide-react';

interface FinanceDashboardProps {
  requests: ProcurementRequest[];
  payments: PayPalPaymentRecord[];
  onSelectApproval: (id: string) => void;
  onNavigatePayments?: () => void;
}

export const FinanceDashboard: React.FC<FinanceDashboardProps> = ({
  requests,
  payments,
  onSelectApproval,
  onNavigatePayments
}) => {
  // Pending payments awaiting Finance action (Section 19)
  const pendingPayments = requests.filter(
    r => r.status === 'AWAITING_FINANCE' || r.status === 'APPROVED' || r.status === 'PAYMENT_PENDING'
  );

  const paidRequests = requests.filter(r => r.status === 'PAID');
  const totalSettledAmount = payments.reduce((acc, p) => acc + p.amount, 0) ||
    paidRequests.reduce((acc, r) => acc + (r.approval?.approvedAmount || r.recommendation?.recommendedAmount || 0), 0);

  return (
    <div className="space-y-6 py-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-purple-600 font-bold mb-1">
            <Wallet className="w-4 h-4" />
            <span>ENTERPRISE TREASURY SUITE</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Finance Approval & Payment Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review requester-approved procurement requests and authorize secure PayPal Sandbox disbursements.
          </p>
        </div>

        <div className="p-2 bg-purple-50 border border-purple-200 rounded-xl text-xs font-semibold text-purple-800 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          <span>Role: Finance Approver (Treasury)</span>
        </div>
      </div>

      {/* 3 Metric Cards matching Section 19 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-amber-600 font-bold uppercase tracking-wider">Pending Payments</div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {pendingPayments.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Requester approved & awaiting authorization</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Paid & Settled</div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 font-mono tabular-nums">
            {paidRequests.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Disbursed via PayPal Sandbox</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Total Disbursed</div>
          <div className="mt-2 text-2xl font-bold text-indigo-700 font-mono tabular-nums">
            ₹{totalSettledAmount.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Authoritative ledger total</div>
        </div>
      </div>

      {/* SECTION 19: Actionable Workflow Cards (Payment Required) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Procurement Orders Requiring Payment</h2>
            <p className="text-xs text-slate-500">
              Procurements approved by requesters ready for final financial authorization and PayPal checkout.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">{pendingPayments.length} Actionable</span>
        </div>

        {pendingPayments.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <div className="font-bold text-slate-700">All procurement payments are up to date!</div>
            <p className="mt-1">When a requester approves an AI recommended quotation, it will appear here for review and settlement.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingPayments.map(req => {
              const supplierName =
                req.approval?.approvedSupplier ||
                req.recommendation?.recommendedSupplierName ||
                (req.quotes[0]?.supplierName) ||
                'Approved Supplier';

              const amount =
                req.approval?.approvedAmount ||
                req.recommendation?.recommendedAmount ||
                (req.quotes[0]?.grandTotal) ||
                req.maxBudget;

              const requesterName = req.approval?.approvedBy || req.createdBy || 'Requester';

              return (
                <div
                  key={req.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-purple-300 hover:shadow-md transition-all space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-purple-50 text-purple-700 font-bold border border-purple-200">
                        PAYMENT REQUIRED
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-2 line-clamp-1">
                        Procurement: {req.requestedQuantity} {req.productService || req.title}
                      </h3>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{req.code}</div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-sans block">Payable Amount</span>
                      <span className="text-base font-bold text-emerald-700 font-mono">
                        ₹{amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Section 19 Example Card Details */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Supplier:</span>
                      <span className="font-bold text-slate-900">{supplierName}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Requester:</span>
                      <span className="font-semibold text-slate-800">{requesterName}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">AI Recommendation:</span>
                      <span className="text-indigo-700 font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Approved ({req.recommendation?.confidenceScore || 92}%)</span>
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Requester Approval:</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Approved</span>
                      </span>
                    </div>
                  </div>

                  {/* Review & Pay CTA (Section 19) */}
                  <button
                    onClick={() => onSelectApproval(req.id)}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <span>Review & Pay</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Settled Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">Settled Payments History</h2>
          <span className="text-xs font-mono text-slate-400">{paidRequests.length} Transactions</span>
        </div>

        {paidRequests.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No completed PayPal settlements yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] text-slate-500 font-semibold font-sans">
                <tr>
                  <th className="px-4 py-3">PO Reference</th>
                  <th className="px-4 py-3">Supplier Beneficiary</th>
                  <th className="px-4 py-3 text-right">Amount (INR)</th>
                  <th className="px-4 py-3 text-center">Payment Method</th>
                  <th className="px-4 py-3 text-center">PayPal Transaction ID</th>
                  <th className="px-4 py-3 text-center">Settlement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paidRequests.map(r => {
                  const amt = r.payment?.amount || r.approval?.approvedAmount || r.recommendation?.recommendedAmount || 0;
                  const suppName = r.payment?.supplierName || r.approval?.approvedSupplier || r.recommendation?.recommendedSupplierName || 'Supplier';
                  const txId = r.payment?.captureId || r.payment?.orderId || 'PAYPAL-CAPTURED';

                  return (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-900">{r.code}</td>
                      <td className="px-4 py-3 font-sans font-medium text-slate-800">{suppName}</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-700">₹{amt.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-center font-sans text-slate-600">PayPal Sandbox</td>
                      <td className="px-4 py-3 text-center text-indigo-700 font-bold">{txId}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          COMPLETED
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
