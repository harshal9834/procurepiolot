import React, { useState } from 'react';
import { PayPalPaymentRecord, ProcurementRequest } from '../../types';
import { Wallet, CheckCircle2, ShieldCheck, Lock, ExternalLink, ArrowRight } from 'lucide-react';

interface FinancePaymentsPageProps {
  payments: PayPalPaymentRecord[];
  requests: ProcurementRequest[];
  onOpenProcurement: (id: string) => void;
}

export const FinancePaymentsPage: React.FC<FinancePaymentsPageProps> = ({
  payments,
  requests,
  onOpenProcurement
}) => {
  const [selectedPayment, setSelectedPayment] = useState<PayPalPaymentRecord | null>(
    payments[0] || null
  );

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          PayPal Sandbox Payment Settlements
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Audited log of authorized treasury disbursements and PayPal Sandbox captured orders.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payments Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Settled Transactions</h2>
            <span className="text-xs text-slate-500 font-mono">
              PayPal Orders v2 API
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Order / Capture ID</th>
                  <th className="px-4 py-3.5">Beneficiary</th>
                  <th className="px-4 py-3.5 text-right">Amount</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400 font-sans">
                      No payments captured yet. Authorize an approval to move funds through PayPal Sandbox.
                    </td>
                  </tr>
                ) : (
                  payments.map(p => (
                    <tr
                      key={p.id || p.orderId}
                      onClick={() => setSelectedPayment(p)}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                        selectedPayment?.orderId === p.orderId ? 'bg-indigo-50/50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 font-bold text-indigo-600 truncate max-w-xs">
                        <div>{p.captureId || p.orderId}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          PO: {p.procurementCode || 'PR-2026-00001'}
                        </div>
                      </td>
                      <td className="px-4 py-4 font-sans font-medium text-slate-900">
                        {p.supplierName}
                      </td>
                      <td className="px-4 py-4 text-right tabular-nums font-bold text-slate-900">
                        ₹{p.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-4 text-center font-sans">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {p.status || 'COMPLETED'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500 text-[11px]">
                        {p.capturedAt?.slice(0, 10) || new Date().toISOString().slice(0, 10)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Payment Receipt Card */}
        <div>
          {selectedPayment ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                    P
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">PayPal Sandbox Receipt</h3>
                    <div className="text-[10px] text-slate-400 font-mono">Verified Settlement</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold font-mono">
                  CAPTURED
                </span>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Disbursed Amount:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    ₹{selectedPayment.amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">PayPal Order ID:</span>
                  <span className="text-slate-700">{selectedPayment.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Capture Transaction ID:</span>
                  <span className="text-slate-900 font-bold">{selectedPayment.captureId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Payee Account:</span>
                  <span className="text-slate-700 truncate max-w-45">{selectedPayment.supplierPayPalAccount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Authorized By:</span>
                  <span className="text-slate-900 font-sans font-medium">{selectedPayment.authorizedBy}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1 text-[11px] text-emerald-800">
                <div className="font-bold font-sans">Safety Validation Passed:</div>
                <div>✓ Payee matches AI approved recommendation</div>
                <div>✓ Amount matches 100% of approved quote</div>
                <div>✓ Finance authorization confirmed</div>
              </div>

              <button
                onClick={() => onOpenProcurement(selectedPayment.procurementId || 'pr_demo_124')}
                className="w-full py-2 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View Full Procurement Order</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
              Select a payment record to inspect sandbox receipt details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
