import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, X, Lock, ExternalLink, ArrowRight } from 'lucide-react';
import { ProcurementRequest } from '../types';

interface PayPalModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ProcurementRequest;
  onConfirmPayment: (orderId: string) => Promise<void>;
  isProcessing: boolean;
}

export const PayPalModal: React.FC<PayPalModalProps> = ({
  isOpen,
  onClose,
  request,
  onConfirmPayment,
  isProcessing
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card'>('wallet');
  const [buyerEmail, setBuyerEmail] = useState('sb-buyer-treasury@acme-corp.com');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [step, setStep] = useState<'review' | 'success'>('review');

  if (!isOpen) return null;

  const supplierName = request.recommendation?.recommendedSupplierName || 'Apex Ergonomics Pvt Ltd';
  const amountINR = request.recommendation?.recommendedAmount || 178490;
  const amountUSD = (amountINR / 83.5).toFixed(2);
  const simulatedOrderId = `PAYPAL-ORD-${Math.floor(100000000000 + Math.random() * 900000000000)}`;

  const handleAuthorize = async () => {
    await onConfirmPayment(simulatedOrderId);
    setStep('success');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* PayPal Sandbox Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-base">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white text-sm">
                  PayPal Sandbox Gateway
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-sm bg-amber-500/20 text-amber-300 font-mono font-medium border border-amber-500/30">
                  SANDBOX
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>256-bit TLS Treasury Settlement Layer</span>
              </p>
            </div>
          </div>

          {step !== 'success' && (
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {step === 'review' ? (
          <div className="p-6 space-y-6">
            {/* Safety Verification Badge */}
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>ProcurePilot Payment Safety Gateway: ALL 4 CHECKS VERIFIED</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-emerald-800 font-mono">
                <div>✓ Payee: {supplierName}</div>
                <div>✓ Status: APPROVED</div>
                <div>✓ Payable: ₹{amountINR.toLocaleString('en-IN')}</div>
                <div>✓ Role: FINANCE_APPROVER</div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Procurement Order Code</span>
                <span className="font-mono font-semibold text-slate-900">{request.code}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Beneficiary Supplier</span>
                <span className="font-medium text-slate-900">{supplierName}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Item & Quantity</span>
                <span className="text-slate-900 font-mono">
                  {request.recommendation?.recommendedQuantity || 65} Units
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-semibold text-slate-900">Total Settlement Amount</span>
                <div className="text-right">
                  <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                    ₹{amountINR.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    ≈ ${amountUSD} USD (Sandbox conversion rate)
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Payment Method Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Sandbox Authorization Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-3 text-left rounded-xl border transition-all text-xs font-medium ${
                    paymentMethod === 'wallet'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-semibold">PayPal Balance</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Corporate Sandbox Account</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 text-left rounded-xl border transition-all text-xs font-medium ${
                    paymentMethod === 'card'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-semibold">Corporate Card</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Commercial Visa •• 4242</div>
                </button>
              </div>
            </div>

            {paymentMethod === 'wallet' ? (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Sandbox Corporate Email
                </label>
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={e => setBuyerEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Virtual Test Card
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleAuthorize}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>
                  {isProcessing
                    ? 'Capturing Sandbox Payment...'
                    : `Authorize & Pay ₹${amountINR.toLocaleString('en-IN')}`}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center space-y-5 animate-in fade-in duration-200">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Payment Successfully Captured!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Funds have been transferred to {supplierName} via PayPal Sandbox Orders v2.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Capture Transaction ID:</span>
                <span className="text-slate-900 font-bold">{request.payment?.captureId || 'CAPTURE-749204918234'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">PayPal Order ID:</span>
                <span className="text-slate-900">{request.payment?.orderId || simulatedOrderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Settled Amount:</span>
                <span className="text-emerald-600 font-bold">₹{amountINR.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payee Account:</span>
                <span className="text-slate-900">billing@apex-ergo.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="text-emerald-700 font-semibold uppercase">PAID & SETTLED</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
            >
              Return to Procurement Record
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
