import React, { useState } from 'react';
import { ProcurementRequest } from '../../types';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldCheck,
  Package,
  DollarSign,
  AlertTriangle,
  Lock,
  FileCheck2,
  FileText
} from 'lucide-react';
import { PayPalModal } from '../PayPalModal';

interface FinanceApprovalPageProps {
  request: ProcurementRequest;
  onApproveAndPay: (orderId: string) => Promise<void>;
  onSubmitApprovalDecision: (decision: 'APPROVE' | 'REJECT' | 'CHANGES', note: string) => Promise<void>;
  onBack: () => void;
  isProcessing: boolean;
}

export const FinanceApprovalPage: React.FC<FinanceApprovalPageProps> = ({
  request,
  onApproveAndPay,
  onSubmitApprovalDecision,
  onBack,
  isProcessing
}) => {
  const [note, setNote] = useState('Authorized based on AI value scoring and inventory optimization.');
  const [isPayPalOpen, setIsPayPalOpen] = useState(false);

  const supplier = request.recommendation?.recommendedSupplierName || 'Apex Ergonomics Pvt Ltd';
  const amount = request.recommendation?.recommendedAmount || 178490;
  const isPaid = request.status === 'PAID';

  const handleApproveClick = async () => {
    await onSubmitApprovalDecision('APPROVE', note);
    setIsPayPalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span>FINANCE APPROVAL GATE</span>
            <span aria-hidden="true">·</span>
            <span className="font-bold text-slate-900">{request.code}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {request.title}
          </h1>
        </div>

        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Approvals</span>
        </button>
      </div>

      {/* 1. Procurement Summary & Budget Status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Procurement & Budget Verification</span>
          </h2>
          <span className="text-xs font-mono font-bold text-emerald-600">
            Budget Compliant (71.4% utilization)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-slate-500 font-sans">Authorized Budget Cap</div>
            <div className="text-base font-bold text-slate-900 mt-1 tabular-nums">
              ₹{request.maxBudget.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200">
            <div className="text-indigo-900 font-sans font-semibold">Recommended Payable</div>
            <div className="text-base font-bold text-indigo-700 mt-1 tabular-nums">
              ₹{amount.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
            <div className="text-emerald-900 font-sans font-semibold">Budget Surplus / Savings</div>
            <div className="text-base font-bold text-emerald-700 mt-1 tabular-nums">
              ₹{(request.maxBudget - amount).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-slate-500 font-sans">Cost Center</div>
            <div className="text-base font-bold text-slate-900 mt-1 font-sans truncate">
              {request.costCenter || 'CC-OPS-01'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Inventory Analysis */}
      {request.inventoryCheck && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-600" />
              <span>Inventory Audit Verification</span>
            </h2>
            <span className="text-xs font-mono font-bold text-indigo-600">
              35 Units Subtracted
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            {request.inventoryCheck.commentary}
          </p>
        </div>
      )}

      {/* 3. AI Recommendation & Risk Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>AI Recommendation & Rationale</span>
          </h2>
          <span className="text-xs font-mono text-emerald-600 font-bold">
            Confidence: 92%
          </span>
        </div>

        <div className="space-y-2">
          {request.recommendation?.explanationBullets.map((bullet, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
              <span>{bullet}</span>
            </div>
          ))}
        </div>

        {/* Supporting Quotation Document Link */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Supporting Quotation: <strong>Apex_Ergonomics_Quote_APX891.pdf</strong></span>
          </div>
          <span className="text-emerald-700 font-mono font-semibold">Verified GST & BIFMA Specs</span>
        </div>
      </div>

      {/* 4. Finance Approval Action Panel (Section 29) */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Treasury Approval & PayPal Execution
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-semibold">
            Immutable Disbursement Cap: ₹{amount.toLocaleString('en-IN')}
          </span>
        </div>

        {isPaid ? (
          <div className="p-4 bg-emerald-950/60 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold text-white">Payment Already Settled</div>
                <div className="text-emerald-300">Capture ID: {request.payment?.captureId}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-emerald-400 font-bold">₹{amount.toLocaleString('en-IN')}</div>
              <div className="text-slate-400 text-[10px]">Beneficiary: {supplier}</div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Approval Note / Treasury Comment (Appended to Audit Trail)
              </label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleApproveClick}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-md shadow-emerald-400/20 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Pay with PayPal Sandbox</span>
              </button>

              <button
                type="button"
                onClick={() => onSubmitApprovalDecision('CHANGES', note)}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 rounded-xl transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Request Negotiation Changes</span>
              </button>

              <button
                type="button"
                onClick={() => onSubmitApprovalDecision('REJECT', note)}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 rounded-xl transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Procurement</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PayPal Modal */}
      <PayPalModal
        isOpen={isPayPalOpen}
        onClose={() => setIsPayPalOpen(false)}
        request={request}
        onConfirmPayment={onApproveAndPay}
        isProcessing={isProcessing}
      />
    </div>
  );
};
