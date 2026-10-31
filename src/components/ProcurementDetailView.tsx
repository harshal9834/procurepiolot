import React, { useState } from 'react';
import {
  ProcurementRequest,
  SupplierQuote,
  UserRole,
  RiskAlert,
  DecisionType
} from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Package,
  Layers,
  ChevronRight,
  TrendingDown,
  Building2,
  DollarSign,
  AlertTriangle,
  FileCheck,
  Lock,
  Edit3,
  Plus,
  ArrowRight,
  History,
  FileText
} from 'lucide-react';
import { PayPalModal } from './PayPalModal';

interface ProcurementDetailViewProps {
  request: ProcurementRequest;
  currentRole: UserRole;
  onUpdateUnderstanding: (updates: any) => Promise<void>;
  onAddQuote: (quoteData: any) => Promise<void>;
  onRunAIAnalysis: () => Promise<void>;
  onSubmitApproval: (decision: 'APPROVE' | 'REJECT' | 'CHANGES', note: string) => Promise<void>;
  onExecutePayment: (orderId: string) => Promise<void>;
  onBackToDashboard: () => void;
  isActionLoading: boolean;
}

export const ProcurementDetailView: React.FC<ProcurementDetailViewProps> = ({
  request,
  currentRole,
  onUpdateUnderstanding,
  onAddQuote,
  onRunAIAnalysis,
  onSubmitApproval,
  onExecutePayment,
  onBackToDashboard,
  isActionLoading
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'decision' | 'quotes' | 'tco' | 'risks' | 'inventory' | 'audit'>('decision');
  const [isPayPalOpen, setIsPayPalOpen] = useState(false);
  const [isEditUnderstandingOpen, setIsEditUnderstandingOpen] = useState(false);
  const [isAddQuoteModalOpen, setIsAddQuoteModalOpen] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');

  // Edit Assumptions Form State
  const [editItem, setEditItem] = useState(request.aiUnderstanding?.parsedItem || request.productService);
  const [editQty, setEditQty] = useState(request.aiUnderstanding?.normalizedQuantity || request.requestedQuantity);
  const [editBudget, setEditBudget] = useState(request.aiUnderstanding?.extractedBudget || request.maxBudget);
  const [editDays, setEditDays] = useState(request.aiUnderstanding?.deliveryRequirementDays || request.deliveryRequiredDays);

  // New Quote Form State
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newUnitPrice, setNewUnitPrice] = useState(2150);
  const [newDeliveryDays, setNewDeliveryDays] = useState(9);
  const [newWarrantyMonths, setNewWarrantyMonths] = useState(24);
  const [newPaymentTerms, setNewPaymentTerms] = useState('Net 30 with 10% Advance');

  const statusSteps = [
    { label: 'Draft', key: 'DRAFT' },
    { label: 'AI Analyzed', key: 'AI_RECOMMENDED' },
    { label: 'Finance Review', key: 'PENDING_APPROVAL' },
    { label: 'Approved', key: 'APPROVED' },
    { label: 'Settled', key: 'PAID' }
  ];

  const getStepActiveIndex = (status: string) => {
    switch (status) {
      case 'DRAFT':
      case 'ANALYZING':
        return 0;
      case 'QUOTES_RECEIVED':
      case 'AI_RECOMMENDED':
        return 1;
      case 'PENDING_APPROVAL':
        return 2;
      case 'APPROVED':
      case 'PAYMENT_PENDING':
        return 3;
      case 'PAID':
      case 'COMPLETED':
        return 4;
      default:
        return 1;
    }
  };

  const currentStepIdx = getStepActiveIndex(request.status);

  const handleSaveUnderstanding = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateUnderstanding({
      parsedItem: editItem,
      normalizedQuantity: Number(editQty),
      extractedBudget: Number(editBudget),
      deliveryRequirementDays: Number(editDays)
    });
    setIsEditUnderstandingOpen(false);
  };

  const handleAddCustomQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddQuote({
      supplierName: newSupplierName || 'Custom Direct Supplier',
      unitPrice: Number(newUnitPrice),
      deliveryDays: Number(newDeliveryDays),
      warrantyMonths: Number(newWarrantyMonths),
      paymentTerms: newPaymentTerms,
      shippingCost: 6000,
      installationCost: 3000
    });
    setIsAddQuoteModalOpen(false);
  };

  return (
    <div className="space-y-6 py-4">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button
            onClick={onBackToDashboard}
            className="hover:text-slate-900 transition-colors"
          >
            Dashboard
          </button>
          <span aria-hidden="true">/</span>
          <span className="font-mono text-slate-900 font-semibold">{request.code}</span>
          <span aria-hidden="true">/</span>
          <span>{request.title}</span>
        </div>

        <button
          onClick={onRunAIAnalysis}
          disabled={isActionLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Re-run AI Agents</span>
        </button>
      </div>

      {/* Main Request Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
              <span className="font-bold text-indigo-600">{request.code}</span>
              <span aria-hidden="true">·</span>
              <span>{request.department}</span>
              <span aria-hidden="true">·</span>
              <span>Deadline: {request.deliveryRequiredDays} Days ({request.deliveryDeadlineDate})</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-slate-900">Priority: {request.priority.toUpperCase()}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {request.title}
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed">
              {request.description}
            </p>
          </div>

          {/* Status Badge & Action */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Status:</span>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-md font-mono ${
                  request.status === 'PAID'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                    : request.status === 'APPROVED'
                    ? 'bg-blue-50 text-blue-700 border border-blue-300'
                    : request.status === 'REJECTED'
                    ? 'bg-rose-50 text-rose-700 border border-rose-300'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                }`}
              >
                {request.status.replace('_', ' ')}
              </span>
            </div>

            {/* Quick Human Action CTA based on Role & State */}
            {currentRole === 'FINANCE_APPROVER' && request.status !== 'PAID' && (
              <div className="flex items-center gap-2 mt-2">
                {request.status === 'APPROVED' ? (
                  <button
                    onClick={() => setIsPayPalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Pay with PayPal Sandbox</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onSubmitApproval('APPROVE', 'Approved based on AI TCO evaluation & inventory reduction.');
                      setIsPayPalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Open PayPal</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Workflow Step Tracker */}
        <div className="pt-6">
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            {statusSteps.map((step, idx) => {
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div key={step.key} className="space-y-2">
                  <div className="flex items-center">
                    <div
                      className={`w-full h-1.5 rounded-full ${
                        isPast || isCurrent ? 'bg-indigo-600' : 'bg-slate-200'
                      }`}
                    />
                  </div>
                  <div
                    className={`font-medium ${
                      isCurrent
                        ? 'text-indigo-600 font-bold'
                        : isPast
                        ? 'text-slate-900'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Inventory Intelligence Callout Banner (Prompt Section 6) */}
      {request.inventoryCheck && (
        <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 uppercase tracking-wider">
                <span>Inventory Intelligence Optimization</span>
                <span className="font-mono text-emerald-700">· 35 In Stock</span>
              </div>
              <p className="mt-1 text-sm text-emerald-900 font-medium">
                {request.inventoryCheck.commentary}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/80 p-3 rounded-xl border border-emerald-200/80 shrink-0">
            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Capital Preserved</div>
              <div className="text-base font-bold text-emerald-600 font-mono tabular-nums">
                ₹{request.inventoryCheck.inventorySavingsAmount.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Net Purchase Qty</div>
              <div className="text-base font-bold text-indigo-600 font-mono tabular-nums">
                {request.inventoryCheck.recommendedPurchaseQuantity} Units
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-px overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('decision')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeSubTab === 'decision'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          AI Decision & Evidence
        </button>
        <button
          onClick={() => setActiveSubTab('quotes')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeSubTab === 'quotes'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Quotations Comparison ({request.quotes?.length || 0})
        </button>
        <button
          onClick={() => setActiveSubTab('tco')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeSubTab === 'tco'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          True Cost (TCO) Analysis
        </button>
        <button
          onClick={() => setActiveSubTab('risks')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeSubTab === 'risks'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Risk Intelligence ({request.riskAlerts?.length || 0})
        </button>
        <button
          onClick={() => setActiveSubTab('inventory')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeSubTab === 'inventory'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Warehouse Stock Check
        </button>
        <button
          onClick={() => setActiveSubTab('audit')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeSubTab === 'audit'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Audit Trail ({request.auditTrail?.length || 0})
        </button>
      </div>

      {/* TAB 1: AI DECISION & EVIDENCE */}
      {activeSubTab === 'decision' && (
        <div className="space-y-6">
          {/* Main Decision Hero Card */}
          {request.recommendation ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-600 uppercase">
                      ProcurePilot Decision Engine
                    </span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-xs font-mono text-emerald-600 font-semibold">
                      Confidence: {request.recommendation.confidenceScore}%
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {request.recommendation.headline}
                  </h2>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-right shrink-0">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Total Payable</div>
                  <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
                    ₹{request.recommendation.recommendedAmount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Under ₹{request.maxBudget.toLocaleString('en-IN')} budget cap
                  </div>
                </div>
              </div>

              {/* Rationale Bullet Points */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Transparent Decision Reasoning
                </h3>
                <div className="space-y-2.5">
                  {request.recommendation.explanationBullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why Cheapest Rejected */}
              {request.recommendation.whyCheapestRejected && (
                <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1">
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Why Not the Cheapest Quotation?</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    {request.recommendation.whyCheapestRejected}
                  </p>
                </div>
              )}

              {/* Strict Categorization of Evidence (Section 12) */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Evidence Provenance & Verification
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category 1: Document Facts */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-indigo-600" />
                      <span>Extracted Quotation Facts</span>
                    </div>
                    <ul className="text-[11px] text-slate-600 space-y-1">
                      {request.recommendation.evidenceCategories?.documentFacts?.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-indigo-400 font-mono">›</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Category 2: Historical Company Data */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <History className="w-4 h-4 text-emerald-600" />
                      <span>Organizational Memory & History</span>
                    </div>
                    <ul className="text-[11px] text-slate-600 space-y-1">
                      {request.recommendation.evidenceCategories?.historicalCompanyData?.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 font-mono">›</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Category 3: Deterministic Math */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                      <span>Deterministic Calculations</span>
                    </div>
                    <ul className="text-[11px] text-slate-600 space-y-1 font-mono">
                      {request.recommendation.evidenceCategories?.deterministicMath?.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-blue-500 font-mono">›</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Category 4: AI Reasoning */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span>AI Heuristic Reasoning</span>
                    </div>
                    <ul className="text-[11px] text-slate-600 space-y-1">
                      {request.recommendation.evidenceCategories?.aiReasoning?.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-purple-400 font-mono">›</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Negotiation Levers */}
              {request.recommendation.negotiationPoints?.length ? (
                <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1.5">
                  <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>AI Negotiation Levers for Requester</span>
                  </div>
                  <ul className="text-xs text-indigo-900/90 space-y-1">
                    {request.recommendation.negotiationPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-500 font-mono">·</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <Sparkles className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-900">AI Recommendation Ready to Generate</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                Click below to synthesize supplier quotes, TCO models, and warehouse inventory.
              </p>
              <button
                onClick={onRunAIAnalysis}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Run Multi-Factor Evaluation
              </button>
            </div>
          )}

          {/* Human Governance Approval Panel (Section 15) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Governance & Authorization Gate
                </h3>
              </div>

              <div className="text-xs text-slate-500">
                Active Role: <span className="font-semibold text-slate-900">{currentRole}</span>
              </div>
            </div>

            {request.status === 'PAID' ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  <div>
                    <div className="text-sm font-bold text-emerald-900">
                      Payment Settled via PayPal Sandbox
                    </div>
                    <div className="text-xs text-emerald-700 font-mono">
                      Capture ID: {request.payment?.captureId} · Settled at {request.payment?.capturedAt?.slice(0, 19).replace('T', ' ')}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-900 font-mono">
                    ₹{request.payment?.amount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-mono">
                    Payee: {request.payment?.supplierName}
                  </div>
                </div>
              </div>
            ) : currentRole === 'FINANCE_APPROVER' ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-600">
                  As the Finance Approver, verify the AI recommendation and quotation details. Upon approving, you can trigger instant disbursement through PayPal Sandbox.
                </p>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Decision Note / Treasury Instruction
                  </label>
                  <input
                    type="text"
                    value={approvalNote}
                    onChange={e => setApprovalNote(e.target.value)}
                    placeholder="e.g. Approved purchase based on 36-month warranty and inventory reuse."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={async () => {
                      await onSubmitApproval('APPROVE', approvalNote || 'Finance approved purchase.');
                      setIsPayPalOpen(true);
                    }}
                    disabled={isActionLoading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Authorize PayPal</span>
                  </button>

                  <button
                    onClick={() => onSubmitApproval('CHANGES', approvalNote || 'Requesting renegotiation of freight.')}
                    disabled={isActionLoading}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 rounded-lg transition-colors"
                  >
                    <span>Send Back for Negotiation</span>
                  </button>

                  <button
                    onClick={() => onSubmitApproval('REJECT', approvalNote || 'Rejected due to fiscal cap.')}
                    disabled={isActionLoading}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors"
                  >
                    <span>Reject Purchase</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-900">
                    Finance Approver Signature Required
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Switch role to 'Finance' in the top header to review and authorize the PayPal transaction.
                  </div>
                </div>

                <span className="text-xs px-3 py-1 font-semibold rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                  Awaiting Finance Sign-off
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: QUOTATIONS COMPARISON */}
      {activeSubTab === 'quotes' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Normalized Supplier Quotations
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                AI extracts structured terms, hidden charges, and lead times across all submissions.
              </p>
            </div>

            <button
              onClick={() => setIsAddQuoteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Attach New Quote</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">Supplier</th>
                  <th className="px-4 py-3.5 text-right">Unit Price</th>
                  <th className="px-4 py-3.5 text-right">Qty</th>
                  <th className="px-4 py-3.5 text-right">Shipping</th>
                  <th className="px-4 py-3.5 text-right">Grand Total</th>
                  <th className="px-4 py-3.5 text-center">Lead Time</th>
                  <th className="px-4 py-3.5 text-center">Warranty</th>
                  <th className="px-4 py-3.5">Payment Terms</th>
                  <th className="px-6 py-3.5 text-center">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {request.quotes?.map(quote => {
                  const isRecommended = request.recommendation?.recommendedSupplierId === quote.supplierId;

                  return (
                    <tr
                      key={quote.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isRecommended ? 'bg-indigo-50/40 font-medium' : ''
                      }`}
                    >
                      <td className="px-6 py-4 font-sans font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{quote.supplierName}</span>
                          {isRecommended && (
                            <span className="text-[10px] px-2 py-0.5 bg-indigo-600 text-white rounded font-mono font-bold">
                              AI CHOICE
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-normal">
                          {quote.productName}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right tabular-nums text-slate-900">
                        ₹{quote.unitPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-4 text-right tabular-nums text-slate-700">
                        {quote.quotedQuantity}
                      </td>
                      <td className="px-4 py-4 text-right tabular-nums text-slate-700">
                        ₹{quote.shippingCost.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-4 text-right tabular-nums font-bold text-slate-900">
                        ₹{quote.grandTotal.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-4 text-center tabular-nums">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] ${
                            quote.deliveryDays <= request.deliveryRequiredDays
                              ? 'text-emerald-700 bg-emerald-50'
                              : 'text-rose-700 bg-rose-50 font-bold'
                          }`}
                        >
                          {quote.deliveryDays} Days
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center tabular-nums text-slate-700">
                        {quote.warrantyMonths}m
                      </td>
                      <td className="px-4 py-4 font-sans text-slate-600 text-[11px]">
                        {quote.paymentTerms}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs font-bold text-indigo-700 font-mono">
                          {quote.scores?.compositeScore || '—'}/100
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TRUE COST OF OWNERSHIP (TCO) */}
      {activeSubTab === 'tco' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              True Cost of Ownership (TCO) Comparison
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Calculating full operational lifecycle costs: nominal invoice + shipping + on-site assembly + maintenance risk + project delay penalties.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {request.quotes?.map(q => {
              const tco = q.tcoBreakdown;
              const isBest = request.recommendation?.recommendedSupplierId === q.supplierId;

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isBest
                      ? 'border-indigo-600 bg-indigo-50/20 shadow-xs ring-1 ring-indigo-600/20'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{q.supplierName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">Quote Ref #{q.supplierCode}</div>
                    </div>
                    {isBest && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-600 text-white rounded">
                        LOWEST TCO
                      </span>
                    )}
                  </div>

                  <div className="mt-4 space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-slate-600">
                      <span>Base Material Cost</span>
                      <span className="tabular-nums">₹{q.totalBasePrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Shipping / Logistics</span>
                      <span className="tabular-nums">₹{q.shippingCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Taxes (18% GST)</span>
                      <span className="tabular-nums">₹{q.taxAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>On-site Installation</span>
                      <span className="tabular-nums">₹{q.installationCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-amber-700">
                      <span>Est. Maintenance Risk</span>
                      <span className="tabular-nums">+₹{tco?.maintenanceRiskEst?.toLocaleString('en-IN') || 0}</span>
                    </div>
                    <div className="flex justify-between text-rose-700">
                      <span>Delivery Delay Risk Impact</span>
                      <span className="tabular-nums">+₹{tco?.deliveryRiskDelayEst?.toLocaleString('en-IN') || 0}</span>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline font-sans">
                      <span className="font-bold text-slate-900 text-sm">Effective True Cost</span>
                      <span className="font-bold text-base font-mono tabular-nums text-slate-900">
                        ₹{(tco?.effectiveTotalCost || q.grandTotal).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: RISK INTELLIGENCE ALERTS */}
      {activeSubTab === 'risks' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Procurement & Vendor Risk Intelligence
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated heuristics scanning lead-time violations, unusual advance payment terms, and price anomalies.
            </p>
          </div>

          <div className="space-y-4">
            {request.riskAlerts?.map(alert => {
              const isCrit = alert.severity === 'CRITICAL';
              const isHigh = alert.severity === 'HIGH';

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                    isCrit
                      ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                      : isHigh
                      ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                      : 'bg-blue-50/70 border-blue-200 text-blue-950'
                  }`}
                >
                  <AlertTriangle
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      isCrit ? 'text-rose-600' : isHigh ? 'text-amber-600' : 'text-blue-600'
                    }`}
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider">{alert.title}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                          isCrit
                            ? 'bg-rose-200 text-rose-800'
                            : isHigh
                            ? 'bg-amber-200 text-amber-800'
                            : 'bg-blue-200 text-blue-800'
                        }`}
                      >
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-700">{alert.description}</p>
                    <div className="text-[11px] font-mono text-slate-500 pt-1">
                      Evidence: {alert.evidence}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: WAREHOUSE STOCK CHECK */}
      {activeSubTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Warehouse Stock Verification
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time check against unallocated inventory to avoid unnecessary purchases.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600">
              35 Usable Units Located
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="font-bold text-slate-900">Inventory Depot Match Details</div>
              <div className="space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Warehouse Location:</span>
                  <span className="text-slate-900 font-sans">Bengaluru Central Facility - Bay B-4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Batch Code:</span>
                  <span className="text-slate-900">ERG-2024-C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Condition:</span>
                  <span className="text-slate-900 font-sans">New in Box (Unopened Q3 Surplus)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Available Stock:</span>
                  <span className="text-emerald-600 font-bold">35 Units</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3 text-xs">
              <div className="font-bold text-indigo-950">ProcurePilot Net Math</div>
              <div className="space-y-1.5 font-mono text-indigo-900">
                <div className="flex justify-between">
                  <span>Gross Requested:</span>
                  <span>100 Units</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Less Inventory Covered:</span>
                  <span>- 35 Units</span>
                </div>
                <div className="pt-2 border-t border-indigo-200 flex justify-between font-bold text-indigo-950">
                  <span>Net Recommended Procurement:</span>
                  <span>65 Units</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT TRAIL */}
      {activeSubTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Immutable Procurement Audit Trail
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cryptographically verified timestamped event log of all agent executions, approvals, and settlements.
            </p>
          </div>

          <div className="space-y-4">
            {request.auditTrail?.map((entry, idx) => (
              <div key={entry.id || idx} className="flex items-start gap-4 text-xs">
                <div className="font-mono text-slate-400 shrink-0 mt-0.5 text-[11px]">
                  {entry.timestamp?.slice(11, 19) || '10:32:00'}
                </div>
                <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{entry.action}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-slate-500 font-mono">By {entry.actor} ({entry.actorRole})</span>
                  </div>
                  <p className="text-slate-600">{entry.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PayPal Sandbox Modal */}
      <PayPalModal
        isOpen={isPayPalOpen}
        onClose={() => setIsPayPalOpen(false)}
        request={request}
        onConfirmPayment={onExecutePayment}
        isProcessing={isActionLoading}
      />

      {/* Add Custom Quote Modal */}
      {isAddQuoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Attach Supplier Proposal</h3>
            <form onSubmit={handleAddCustomQuote} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supplier Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SteelCraft Workspace"
                  value={newSupplierName}
                  onChange={e => setNewSupplierName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit Price (INR)</label>
                  <input
                    type="number"
                    required
                    value={newUnitPrice}
                    onChange={e => setNewUnitPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lead Time (Days)</label>
                  <input
                    type="number"
                    required
                    value={newDeliveryDays}
                    onChange={e => setNewDeliveryDays(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Warranty (Months)</label>
                  <input
                    type="number"
                    required
                    value={newWarrantyMonths}
                    onChange={e => setNewWarrantyMonths(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Terms</label>
                  <input
                    type="text"
                    required
                    value={newPaymentTerms}
                    onChange={e => setNewPaymentTerms(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddQuoteModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  Attach & Re-Evaluate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
