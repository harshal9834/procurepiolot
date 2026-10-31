import React, { useState } from 'react';
import { ProcurementRequest, User } from '../../types';
import { ArrowLeft, Send, CheckCircle2, DollarSign, FileText, Upload, Calendar, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../../api';

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
  const [submissionMode, setSubmissionMode] = useState<'form' | 'pdf'>('form');

  // Form Fields (Option A)
  const [productName, setProductName] = useState(
    `${request.productService || 'Commercial Product'} (Enterprise Model)`
  );
  const [quotedQuantity, setQuotedQuantity] = useState(
    request.inventoryCheck?.recommendedPurchaseQuantity || request.requestedQuantity || 100
  );
  const [unitPrice, setUnitPrice] = useState(2200);
  const [shippingCost, setShippingCost] = useState(6500);
  const [installationCost, setInstallationCost] = useState(3250);
  const [deliveryDays, setDeliveryDays] = useState(8);
  const [warrantyMonths, setWarrantyMonths] = useState(36);
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [notes, setNotes] = useState('Includes full on-site delivery, assembly, and 3-year commercial warranty.');

  // PDF Extraction Fields (Option B)
  const [rawProposalText, setRawProposalText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedPreview, setExtractedPreview] = useState<any>(null);
  const [validationError, setValidationError] = useState('');

  // Calculations
  const baseSubtotal = unitPrice * quotedQuantity;
  const tax = Math.round(baseSubtotal * 0.18);
  const calculatedGrandTotal = baseSubtotal + tax + shippingCost + installationCost;

  // Handle PDF / Text Extraction (Section 11 Option B)
  const handleExtractFromDocument = async () => {
    if (!rawProposalText.trim()) {
      setValidationError('Please paste quotation document text or drag in a proposal.');
      return;
    }
    setValidationError('');
    setIsExtracting(true);
    try {
      const res = await api.uploadQuote({
        requestId: request.id,
        supplierName: currentUser.companyName || 'Apex Ergonomics Pvt Ltd',
        rawText: rawProposalText,
        fileName: fileName || 'Quotation_Proposal.pdf',
        targetQuantity: quotedQuantity
      });

      if (res && res.quote) {
        setExtractedPreview(res.quote);
        setUnitPrice(res.quote.unitPrice || 2200);
        setDeliveryDays(res.quote.deliveryDays || 8);
        setWarrantyMonths(res.quote.warrantyMonths || 24);
        setPaymentTerms(res.quote.paymentTerms || 'Net 30');
        if (res.quote.productName) setProductName(res.quote.productName);
      }
    } catch (err: any) {
      setValidationError(err.message || 'Quotation extraction failed. Please enter details manually.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Validation (Section 12)
    if (unitPrice <= 0) {
      setValidationError('Unit price must be greater than zero.');
      return;
    }
    if (quotedQuantity <= 0) {
      setValidationError('Quoted quantity must be greater than zero.');
      return;
    }
    if (deliveryDays <= 0) {
      setValidationError('Delivery timeline must be at least 1 day.');
      return;
    }

    await onSubmitQuote({
      supplierId: currentUser.supplierId || `supp_${Date.now()}`,
      supplierName: currentUser.companyName || 'Registered Supplier',
      productName,
      quotedQuantity,
      unitPrice,
      totalBasePrice: baseSubtotal,
      taxAmount: tax,
      shippingCost,
      installationCost,
      grandTotal: calculatedGrandTotal,
      deliveryDays,
      warrantyMonths,
      paymentTerms,
      notes,
      supportingDocumentName: submissionMode === 'pdf' ? (fileName || 'Uploaded_Proposal.pdf') : 'Official_Quote_Form.pdf'
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors mb-1 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Supplier Portal</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-amber-600">RFQ RESPONSE</span>
            <span className="text-slate-300">·</span>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Submit Commercial Quotation
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit your competitive price, delivery schedule, and warranty terms for <strong>{request.code}</strong>.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800">
          Status: Open For Bids
        </div>
      </div>

      {/* SECTION 10: Procurement Request Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
          Procurement Requirement Details
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-medium block">Product Required</span>
            <span className="font-bold text-slate-900">{request.productService || request.title}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-medium block">Quantity</span>
            <span className="font-bold text-slate-900 font-mono">
              {quotedQuantity} {request.unit}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-medium block">Required Within</span>
            <span className="font-bold text-emerald-700 font-mono">
              {request.deliveryRequiredDays} Days ({request.deliveryDeadlineDate})
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-medium block">Max Target Budget</span>
            <span className="font-bold text-slate-900 font-mono">₹{request.maxBudget.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {request.description && (
          <div className="text-xs text-slate-600 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
            <strong className="text-indigo-900">Buyer's Requirements:</strong> {request.description}
          </div>
        )}
      </div>

      {/* SECTION 11: Mode Selector (Form vs Upload PDF) */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          type="button"
          onClick={() => setSubmissionMode('form')}
          className={`pb-2.5 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
            submissionMode === 'form'
              ? 'border-amber-500 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Option A — Form Submission</span>
        </button>

        <button
          type="button"
          onClick={() => setSubmissionMode('pdf')}
          className={`pb-2.5 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
            submissionMode === 'pdf'
              ? 'border-amber-500 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Option B — Upload Proposal PDF / Document</span>
        </button>
      </div>

      {validationError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Option B: PDF / Proposal Document Upload */}
      {submissionMode === 'pdf' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Upload Quotation Document / Proposal Text</h3>
              <p className="text-xs text-slate-500">
                AI extracts supplier, prices, taxes, shipping, delivery timeline, and warranty terms automatically.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setRawProposalText(
                  `OFFICIAL QUOTATION\nVendor: ${currentUser.companyName || 'Apex Ergonomics Ltd'}\nProduct: Ergonomic Mesh Chairs\nQuantity: ${quotedQuantity} Units\nUnit Rate: ₹2,200\nSubtotal: ₹${2200 * quotedQuantity}\nGST (18%): ₹${Math.round(2200 * quotedQuantity * 0.18)}\nShipping: ₹6,500\nAssembly: ₹3,250\nDelivery Days: 8 Business Days\nCommercial Warranty: 36 Months\nPayment Terms: Net 30`
                );
                setFileName('Apex_Official_Commercial_Quote.pdf');
              }}
              className="text-[11px] text-indigo-600 hover:underline font-semibold"
            >
              Paste Demo Proposal
            </button>
          </div>

          <textarea
            rows={5}
            value={rawProposalText}
            onChange={e => setRawProposalText(e.target.value)}
            placeholder="Paste text from your quotation document or invoice breakdown here..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-indigo-500 focus:bg-white"
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">
              Document: <strong>{fileName || 'Quotation_Proposal.pdf'}</strong>
            </span>

            <button
              type="button"
              onClick={handleExtractFromDocument}
              disabled={isExtracting || !rawProposalText.trim()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isExtracting ? 'Extracting Proposal Facts...' : 'Extract & Pre-fill Form'}</span>
            </button>
          </div>

          {/* Extracted Preview Table */}
          {extractedPreview && (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-2">
              <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Extracted Quotation Summary</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] text-emerald-800">
                <div>Unit Price: ₹{extractedPreview.unitPrice?.toLocaleString('en-IN') || 'Not Provided'}</div>
                <div>Grand Total: ₹{extractedPreview.grandTotal?.toLocaleString('en-IN') || 'Not Provided'}</div>
                <div>Delivery: {extractedPreview.deliveryDays ? `${extractedPreview.deliveryDays} days` : 'Not Provided'}</div>
                <div>Warranty: {extractedPreview.warrantyMonths ? `${extractedPreview.warrantyMonths}m` : 'Not Provided'}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form Submission (Option A / Review fields) */}
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Commercial Proposal Items</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Product / Item Specification Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={e => setProductName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-hidden focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Quoted Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={quotedQuantity}
                onChange={e => setQuotedQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-hidden focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Unit Base Price (INR) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">₹</span>
                <input
                  type="number"
                  required
                  min={1}
                  value={unitPrice}
                  onChange={e => setUnitPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-3.5 py-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Delivery Schedule (Business Days) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min={1}
                  value={deliveryDays}
                  onChange={e => setDeliveryDays(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400">Days</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Warranty Offered (Months) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min={0}
                  value={warrantyMonths}
                  onChange={e => setWarrantyMonths(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400">Months</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Freight / Shipping Charges (INR)
              </label>
              <input
                type="number"
                min={0}
                value={shippingCost}
                onChange={e => setShippingCost(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Installation & Unboxing (INR)
              </label>
              <input
                type="number"
                min={0}
                value={installationCost}
                onChange={e => setInstallationCost(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Payment Terms
              </label>
              <select
                value={paymentTerms}
                onChange={e => setPaymentTerms(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500 focus:bg-white font-medium"
              >
                <option value="Net 30">Net 30 Days (Standard Corporate)</option>
                <option value="Net 15">Net 15 Days</option>
                <option value="Net 60">Net 60 Days</option>
                <option value="PayPal Sandbox Settlement">PayPal Sandbox Instant</option>
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Additional Proposal Notes / Certifications
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="ISO certifications, commercial return policy, spare parts availability..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Grand Total Breakdown card */}
          <div className="p-4 bg-slate-900 rounded-xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-sans">Quotation Subtotal Breakdown</span>
              <div className="text-slate-300 font-sans">
                Base: ₹{baseSubtotal.toLocaleString('en-IN')} + 18% GST: ₹{tax.toLocaleString('en-IN')} + Shipping: ₹{shippingCost.toLocaleString('en-IN')} + Assembly: ₹{installationCost.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-sans block">Total Quoted Payable</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">
                ₹{calculatedGrandTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Transmitting Proposal...' : 'Submit Official Commercial Quotation'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
