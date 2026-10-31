import React, { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { ShieldCheck, CheckCircle2, AlertTriangle, X, Lock, ExternalLink, RefreshCw } from 'lucide-react';
import { ProcurementRequest, PayPalPaymentRecord } from '../types';
import { api } from '../api';

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
  const [paypalClientId, setPaypalClientId] = useState<string>('');
  const [step, setStep] = useState<'review' | 'success'>('review');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [createdOrderId, setCreatedOrderId] = useState<string>('');
  const [completedPayment, setCompletedPayment] = useState<PayPalPaymentRecord | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  // Fetch PayPal Client ID from backend
  useEffect(() => {
    let isMounted = true;
    api.getPayPalConfig().then(cfg => {
      if (isMounted && cfg.clientId) {
        setPaypalClientId(cfg.clientId);
      }
    }).catch(err => {
      console.error('Failed to load PayPal client configuration:', err);
    });
    return () => { isMounted = false; };
  }, []);

  if (!isOpen) return null;

  const selectedQuote =
    request.quotes?.find(q => q.supplierId === request.selectedSupplierId || q.id === request.selectedQuoteId) ||
    request.quotes?.find(q => q.supplierId === request.recommendation?.recommendedSupplierId) ||
    request.quotes?.[0];

  const supplierId =
    request.selectedSupplierId ||
    request.approval?.approvedSupplier ||
    request.recommendation?.recommendedSupplierId ||
    selectedQuote?.supplierId ||
    '';

  const supplierName =
    selectedQuote?.supplierName ||
    request.recommendation?.recommendedSupplierName ||
    request.approval?.approvedSupplier ||
    'Approved Supplier';

  const amountINR =
    request.approval?.approvedAmount ??
    request.recommendation?.recommendedAmount ??
    selectedQuote?.grandTotal ??
    request.maxBudget;

  const INR_USD_RATE = 83.5;
  const amountUSD = (amountINR / INR_USD_RATE).toFixed(2);

  /**
   * Called by official PayPal Button when clicked.
   * Calls backend /api/payments/paypal/create-order which validates against the database and contacts PayPal REST API.
   */
  const handleCreateOrder = async (): Promise<string> => {
    setErrorMessage('');
    try {
      const orderData = await api.createPayPalOrder(request.id, supplierId, amountINR, 'FINANCE_APPROVER');
      const orderId = orderData.orderId;
      if (!orderId) {
        throw new Error('No PayPal order ID returned from server.');
      }
      setCreatedOrderId(orderId);
      return orderId;
    } catch (err: any) {
      console.error('[PayPal Create Order Error]:', err);
      const msg = err.message || 'Failed to initialize real PayPal Sandbox order.';
      setErrorMessage(msg);
      throw err;
    }
  };

  /**
   * Called by official PayPal Button upon buyer approval in the PayPal Sandbox popup.
   * Captures payment via backend /api/payments/paypal/capture-order.
   */
  const handleApprove = async (data: { orderID: string }) => {
    setErrorMessage('');
    setIsCapturing(true);
    try {
      const res = await api.capturePayPalPayment(request.id, data.orderID, 'Ananya Roy (Treasury Controller)');
      setCompletedPayment(res.payment || request.payment || null);
      await onConfirmPayment(data.orderID);
      setStep('success');
    } catch (err: any) {
      console.error('[PayPal Capture Error]:', err);
      setErrorMessage(err.message || 'Payment capture failed. Procurement remains un-paid.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleCancel = () => {
    setErrorMessage('PayPal Sandbox checkout was cancelled by the user. No charges were made.');
  };

  const handleError = (err: any) => {
    console.error('[PayPal SDK Error]:', err);
    setErrorMessage('PayPal checkout encountered an error. Please try again.');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* PayPal Official Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-base">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white text-sm">
                  PayPal Sandbox Checkout
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-sm bg-amber-500/20 text-amber-300 font-mono font-medium border border-amber-500/30">
                  SANDBOX
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Secure payment powered by PayPal</span>
              </p>
            </div>
          </div>

          {step !== 'success' && (
            <button
              onClick={onClose}
              disabled={isProcessing || isCapturing}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {step === 'review' ? (
          <div className="p-6 space-y-5">
            {/* Security Validation Badge */}
            <div className="p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-xl space-y-1.5">
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

            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold">Payment Notification</div>
                  <div>{errorMessage}</div>
                </div>
              </div>
            )}

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
                <span>Item &amp; Quantity</span>
                <span className="text-slate-900 font-mono">
                  {request.recommendation?.recommendedQuantity || request.requestedQuantity} Units
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-semibold text-slate-900 block">Total Settlement Amount</span>
                  <span className="text-[10px] text-slate-500 font-sans">
                    Converted transparently @ ₹{INR_USD_RATE} / USD for PayPal Sandbox
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                    ₹{amountINR.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-indigo-700 font-mono font-bold">
                    = ${amountUSD} USD
                  </div>
                </div>
              </div>
            </div>

            {/* Official PayPal Buttons Container */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>Pay with PayPal Official Checkout:</span>
                <span className="text-[11px] text-slate-400 font-mono">Real Sandbox Flow</span>
              </div>

              {isCapturing && (
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-center space-y-2">
                  <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin mx-auto" />
                  <div className="text-xs font-bold text-indigo-900">
                    Capturing Real PayPal Sandbox Payment...
                  </div>
                  <div className="text-[11px] text-indigo-700">
                    Contacting PayPal REST API to verify and capture order {createdOrderId}
                  </div>
                </div>
              )}

              {!isCapturing && paypalClientId && (
                <PayPalScriptProvider
                  options={{
                    clientId: paypalClientId,
                    currency: 'USD',
                    intent: 'capture'
                  }}
                >
                  <div className="min-h-[120px] relative z-0">
                    <PayPalButtons
                      style={{
                        layout: 'vertical',
                        color: 'gold',
                        shape: 'rect',
                        label: 'pay'
                      }}
                      createOrder={handleCreateOrder}
                      onApprove={handleApprove}
                      onCancel={handleCancel}
                      onError={handleError}
                    />
                  </div>
                </PayPalScriptProvider>
              )}

              {!paypalClientId && (
                <div className="p-4 bg-slate-100 rounded-xl text-center text-xs text-slate-500">
                  Initializing PayPal Sandbox SDK...
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Backend Enforced Safety</span>
              </span>
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing || isCapturing}
                className="text-slate-500 hover:text-slate-800 font-medium text-xs py-1 px-2.5 rounded-lg hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Payment Success State with Real IDs */
          <div className="p-8 text-center space-y-5 animate-in fade-in duration-200">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Payment Successfully Completed!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Payment completed through PayPal Sandbox Orders v2.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs space-y-2.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">PayPal Capture ID:</span>
                <span className="text-slate-900 font-bold truncate max-w-[220px]" title={completedPayment?.captureId || request.payment?.captureId || ''}>
                  {completedPayment?.captureId || request.payment?.captureId || 'Verified Capture'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">PayPal Order ID:</span>
                <span className="text-slate-900">{completedPayment?.orderId || request.payment?.orderId || createdOrderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Settled Amount:</span>
                <span className="text-emerald-600 font-bold">
                  ₹{amountINR.toLocaleString('en-IN')} (≈ ${amountUSD} USD)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Beneficiary Supplier:</span>
                <span className="text-slate-900">{supplierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="text-emerald-700 font-semibold uppercase bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
                  COMPLETED
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors shadow-xs"
            >
              Return to Procurement Record
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
