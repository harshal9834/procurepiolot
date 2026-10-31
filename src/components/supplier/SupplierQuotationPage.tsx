import React, { useState } from 'react';
import { ProcurementRequest, User } from '../../types';
import { ArrowLeft, Send, CheckCircle2, DollarSign, FileText } from 'lucide-react';

interface SupplierQuotationPageProps {
  request: ProcurementRequest;
  currentUser: User;
  onSubmitQuote: (quoteData: any) => Promise<void>;
  onBack: () => void;
  isSubmitting: boolean;
}

export const SupplierQuotationPage: React.FC<SupplierQuotationPageProps> = ({
  request,
  currentUser,
  onSubmitQuote,
  onBack,
  isSubmitting
}) => {
  const targetQty = request.inventoryCheck?.recommendedPurchaseQuantity || request.requestedQuantity;

  const [unitPrice, setUnitPrice] = useState(2200);
  const [discountAmount, setDiscountAmount] = useState(7000);
  const [shippingCost, setShippingCost] = useState(6500);
  const [installationCost, setInstallationCost] = useState(3250);
  const [deliveryDays, setDeliveryDays] = useState(8);
  const [warrantyMonths, setWarrantyMonths] = useState(36);
  const [paymentTerms, setPaymentTerms] = useState('Net 30 with 10% Advance');
  const [returnPolicy, setReturnPolicy] = useState('30-day zero penalty replacement for defective components');
  const [notes, setNotes] = useState('Includes complete on-site floor assembly and debris removal.');

  // Automated Calculations matching Section 17
  const subtotal = unitPrice * targetQty;
  const taxableBase = Math.max(0, subtotal - discountAmount);
  const tax = Math.round(taxableBase * 0.18);
  const finalTotal = taxableBase + tax + shippingCost + installationCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmitQuote({
      supplierId: currentUser.supplierId || 'supp_apex',
      supplierName: currentUser.companyName || 'Apex Ergonomics Pvt Ltd',
      productName: `${request.productService} (Commercial Edition)`,
      unitPrice,
      shippingCost,
      installationCost,
      deliveryDays,
      warrantyMonths,
      paymentTerms,
      rawText: `${notes}. Unit rate: ₹${unitPrice}, Discount: ₹${discountAmount}.`,
      supportingDocumentName: 'Apex_Official_Quotation.pdf'
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span>OFFICIAL QUOTATION SUBMISSION</span>
            <span aria-hidden="true">·</span>
            <span className="font-bold text-slate-900">{request.code}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Bid Proposal for {request.title}
          </h1>
        </div>

        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Commercial Pricing Breakdown
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Quantity</label>
              <input
                type="number"
                disabled
                value={targetQty}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-700 font-bold"
              />
              <span className="text-[10px] text-slate-500">Specified by buyer</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit Price (INR)</label>
              <input
                type="number"
                required
                value={unitPrice}
                onChange={e => setUnitPrice(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Volume Discount (INR)</label>
              <input
                type="number"
                value={discountAmount}
                onChange={e => setDiscountAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Freight / Shipping (INR)</label>
              <input
                type="number"
                value={shippingCost}
                onChange={e => setShippingCost(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">On-Site Assembly (INR)</label>
              <input
                type="number"
                value={installationCost}
                onChange={e => setInstallationCost(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Guaranteed Delivery Lead Time</label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  required
                  value={deliveryDays}
                  onChange={e => setDeliveryDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900 font-bold"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono">
                  Days
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Warranty Period (Months)</label>
              <input
                type="number"
                required
                value={warrantyMonths}
                onChange={e => setWarrantyMonths(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Terms</label>
              <input
                type="text"
                required
                value={paymentTerms}
                onChange={e => setPaymentTerms(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div className="text-xs space-y-1">
            <label className="block font-semibold text-slate-700">Contractual Notes / Value Adds</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>
        </div>

        {/* Live Automated Calculation Display matching Section 17 */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Automated Proposal Valuation</span>
            </h3>
            <span className="text-xs font-mono text-emerald-400">Live Formula</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-300">
              <span className="font-sans">Subtotal ({targetQty} × ₹{unitPrice.toLocaleString('en-IN')})</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-emerald-400">
              <span className="font-sans">Volume Discount</span>
              <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="font-sans">Logistics & Shipping</span>
              <span>+ ₹{shippingCost.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="font-sans">On-Site Assembly</span>
              <span>+ ₹{installationCost.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="font-sans">18% GST (Calculated)</span>
              <span>+ ₹{tax.toLocaleString('en-IN')}</span>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline font-sans">
              <span className="text-base font-bold text-white">Final Proposal Total</span>
              <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                ₹{finalTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-md shadow-emerald-400/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Transmitting Proposal...' : 'Submit Quotation to Buyer'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
