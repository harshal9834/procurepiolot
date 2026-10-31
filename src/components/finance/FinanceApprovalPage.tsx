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
  FileText,
  UserCheck,
  Building2,
  Calendar,
  Clock,
  Sparkles,
  CreditCard
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
  const [hasConfirmedReview, setHasConfirmedReview] = useState(false);
  const [note, setNote] = useState('Authorized following complete procurement verification and requester sign-off.');
  const [isPayPalOpen, setIsPayPalOpen] = useState(false);

  // Authoritative data resolution
  const finalAmount = request.approval?.approvedAmount ?? request.recommendation?.recommendedAmount ?? request.quotes?.[0]?.grandTotal ?? request.maxBudget;
  const currency = request.currency || 'INR';

  // Selected Quote resolution
  const selectedQuote =
    request.quotes?.find(q => q.supplierId === request.selectedSupplierId || q.id === request.selectedQuoteId) ||
    request.quotes?.find(q => q.supplierId === request.recommendation?.recommendedSupplierId) ||
    request.quotes?.[0];

  const supplierName =
    selectedQuote?.supplierName ||
    request.recommendation?.recommendedSupplierName ||
    request.approval?.approvedSupplier ||
    'Approved Supplier';

  const isPaid = request.status === 'PAID';

  const handleOpenPayPal = () => {
    if (!hasConfirmedReview) return;
    setIsPayPalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span className="font-semibold text-indigo-600">FINANCE PAYMENT GATEWAY</span>
            <span aria-hidden="true">·</span>
            <span className="font-bold text-slate-900">{request.code}</span>
            <span aria-hidden="true">·</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isPaid
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : request.status === 'AWAITING_FINANCE'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {request.status.replace(/_/g, ' ')}
            </span>
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
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Grid: Procurement Details & Winning Supplier */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Procurement Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-600" />
              <span>Procurement Specification</span>
            </h2>
            <span className="text-xs font-mono font-medium text-slate-500">
              {request.department || 'Operations'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Product / Service</span>
              <span className="font-semibold text-slate-900 text-right">{request.productService}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Required Quantity</span>
              <span className="font-mono font-bold text-slate-900">
                {request.requestedQuantity} {request.unit}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Delivery Requirement</span>
              <span className="font-mono text-slate-900">
                Within {request.deliveryRequiredDays} days ({request.deliveryDeadlineDate})
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Authorized Budget Cap</span>
              <span className="font-mono font-bold text-slate-900">
                ₹{request.maxBudget.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Category / Cost Center</span>
              <span className="text-slate-700">{request.category} ({request.costCenter || 'CC-OPS-01'})</span>
            </div>
            {request.businessJustification && (
              <div className="pt-2 text-[11px] text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                &ldquo;{request.businessJustification}&rdquo;
              </div>
            )}
          </div>
        </div>

        {/* 2. Selected Supplier & Quote Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Selected Supplier & Quotation</span>
            </h2>
            <span className="text-xs font-mono font-bold text-emerald-600">
              ✓ Requester Selected
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Supplier Name</span>
              <span className="font-bold text-slate-900">{supplierName}</span>
            </div>
            {selectedQuote && (
              <>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Unit Price</span>
                  <span className="font-mono text-slate-900">
                    ₹{selectedQuote.unitPrice.toLocaleString('en-IN')} / {request.unit}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Base Subtotal</span>
                  <span className="font-mono text-slate-900">
                    ₹{selectedQuote.totalBasePrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Taxes (GST 18%)</span>
                  <span className="font-mono text-slate-900">
                    ₹{selectedQuote.taxAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Shipping & Delivery</span>
                  <span className="font-mono text-slate-900">
                    {selectedQuote.shippingCost === 0 ? 'Free Shipping' : `₹${selectedQuote.shippingCost.toLocaleString('en-IN')}`} ({selectedQuote.deliveryDays} days)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Warranty & Terms</span>
                  <span className="text-slate-900 font-medium">
                    {Math.round(selectedQuote.warrantyMonths / 12)} Years · {selectedQuote.paymentTerms}
                  </span>
                </div>
                {selectedQuote.supportingDocumentName && (
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1.5 text-indigo-600 font-medium">
                      <FileText className="w-3.5 h-3.5" />
                      {selectedQuote.supportingDocumentName}
                    </span>
                    <span className="text-emerald-600 font-mono text-[10px]">VERIFIED PDF</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3. AI Recommendation & Rationale */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Evaluation & Recommendation Analysis</span>
          </h2>
          {request.recommendation && (
            <span className="text-xs font-mono font-bold text-emerald-600">
              Confidence: {request.recommendation.confidenceScore}%
            </span>
          )}
        </div>

        {request.recommendation ? (
          <div className="space-y-3">
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl">
              <div className="text-xs font-bold text-indigo-950">
                {request.recommendation.headline}
              </div>
              <div className="text-[11px] text-indigo-700 mt-1 font-mono">
                Recommendation: {request.recommendation.decision} · Amount: ₹{request.recommendation.recommendedAmount.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="text-xs font-semibold text-slate-700">Evaluation Points:</div>
              {request.recommendation.explanationBullets.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            Direct quotation reviewed and approved by requester.
          </p>
        )}
      </div>

      {/* 4. Requester Approval Clearance */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-600" />
            <span>Requester Approval Clearance</span>
          </h2>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            VERIFIED & SIGNED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <div className="text-slate-500">Approved By</div>
            <div className="font-bold text-slate-900 mt-0.5">
              {request.requesterApprovedBy || request.approval?.approvedBy || request.createdBy}
            </div>
          </div>
          <div>
            <div className="text-slate-500">Approval Date / Time</div>
            <div className="font-mono text-slate-900 mt-0.5">
              {request.requesterApprovedAt || request.approval?.approvedAt
                ? new Date(request.requesterApprovedAt || request.approval?.approvedAt || '').toLocaleString()
                : 'Prior to Finance Dispatch'}
            </div>
          </div>
          <div>
            <div className="text-slate-500">Requester Decision Note</div>
            <div className="text-slate-700 mt-0.5 italic truncate">
              {request.approval?.decisionNote || 'Recommended supplier approved for procurement.'}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Authoritative Financial Payment Execution Panel */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Financial Authorization & PayPal Settlement
              </h3>
              <p className="text-[11px] text-slate-400">
                Authoritative backend-enforced payment gateway. Client-side amounts cannot be tampered.
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400 font-mono">Final Authoritative Payable</div>
            <div className="text-xl font-bold text-emerald-400 font-mono">
              ₹{finalAmount.toLocaleString('en-IN')} <span className="text-xs text-slate-400">{currency}</span>
            </div>
          </div>
        </div>

        {isPaid ? (
          <div className="p-4 bg-emerald-950/70 border border-emerald-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold text-white text-sm">Disbursement Settled via PayPal</div>
                <div className="text-emerald-300 text-xs mt-0.5">
                  Capture ID: {request.payment?.captureId || 'Verified Capture'} · Order: {request.payment?.orderId || 'PayPal Sandbox'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-emerald-400 font-bold text-base">₹{finalAmount.toLocaleString('en-IN')}</div>
              <div className="text-slate-400 text-[10px]">Beneficiary: {supplierName}</div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Treasury Audit Comment (Saved to immutable audit ledger)
              </label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Explicit Confirmation Checkbox (Section 20 Requirement) */}
            <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="finance-review-confirm"
                  checked={hasConfirmedReview}
                  onChange={e => setHasConfirmedReview(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-600 focus:ring-emerald-500 focus:ring-offset-slate-900 mt-0.5 cursor-pointer"
                />
                <div className="text-xs text-slate-200">
                  <span className="font-bold text-white">
                    I have reviewed this procurement and authorize payment.
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    By checking this box, you certify that the procurement specifications, winning quotation from{' '}
                    <strong>{supplierName}</strong>, and payable sum of{' '}
                    <strong>₹{finalAmount.toLocaleString('en-IN')}</strong> comply with corporate treasury policies.
                  </p>
                </div>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                id="btn-pay-paypal"
                onClick={handleOpenPayPal}
                disabled={!hasConfirmedReview || isProcessing}
                className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed rounded-xl transition-all shadow-md shadow-emerald-400/20"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay with PayPal</span>
              </button>

              <button
                type="button"
                onClick={() => onSubmitApprovalDecision('CHANGES', note)}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 px-4 py-3 text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 rounded-xl transition-colors disabled:opacity-50"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Request Negotiation Changes</span>
              </button>

              <button
                type="button"
                onClick={() => onSubmitApprovalDecision('REJECT', note)}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 px-4 py-3 text-xs font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 rounded-xl transition-colors disabled:opacity-50"
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
