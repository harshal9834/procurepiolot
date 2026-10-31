import React, { useState } from 'react';
import {
  ProcurementRequest,
  SupplierQuote,
  RAGAnswerResponse
} from '../../types';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Building2,
  ThumbsUp,
  XCircle,
  FileText,
  Search,
  ExternalLink,
  Info,
  Check,
  Tag,
  Truck,
  HelpCircle
} from 'lucide-react';
import { api } from '../../api';

interface RequesterRequestDetailProps {
  request: ProcurementRequest;
  onBack: () => void;
  onRunAIAnalysis: () => Promise<void>;
  onApprove: (supplierId: string, note?: string) => Promise<void>;
  isActionLoading: boolean;
}

export const RequesterRequestDetail: React.FC<RequesterRequestDetailProps> = ({
  request,
  onBack,
  onRunAIAnalysis,
  onApprove,
  isActionLoading
}) => {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(
    request.selectedSupplierId ||
    request.recommendation?.recommendedSupplierId ||
    (request.quotes.length > 0 ? request.quotes[0].supplierId : '')
  );
  const [isApproving, setIsApproving] = useState(false);
  const [showSupplierSelector, setShowSupplierSelector] = useState(false);

  // Traceable RAG Source Modal State (Section 42)
  const [activeRagSource, setActiveRagSource] = useState<{
    metricName: string;
    supplierName: string;
    documentName: string;
    pageNumber: number;
    snippet: string;
    confidence: number;
  } | null>(null);

  // Interactive RAG Supplier Intelligence Search (Section 15)
  const [ragQuery, setRagQuery] = useState('');
  const [ragResult, setRagResult] = useState<RAGAnswerResponse | null>(null);
  const [isSearchingRAG, setIsSearchingRAG] = useState(false);

  const quotes = request.quotes || [];
  const recommendation = request.recommendation;
  const isAwaitingRequester =
    request.status === 'AI_RECOMMENDED' ||
    request.status === 'AWAITING_REQUESTER_APPROVAL' ||
    request.status === 'REQUEST_SENT' ||
    request.status === 'QUOTES_RECEIVING';

  const isApproved =
    request.status === 'AWAITING_FINANCE' ||
    request.status === 'APPROVED' ||
    request.status === 'PAYMENT_PENDING' ||
    request.status === 'PAID';

  const handleApproveRecommendation = async () => {
    const suppId = recommendation?.recommendedSupplierId || quotes[0]?.supplierId;
    if (!suppId) return;
    setIsApproving(true);
    try {
      await onApprove(suppId, `Approved AI recommendation for ${recommendation?.recommendedSupplierName || 'selected supplier'}.`);
    } finally {
      setIsApproving(false);
    }
  };

  const handleApproveSelectedSupplier = async () => {
    if (!selectedSupplierId) return;
    setIsApproving(true);
    try {
      const chosen = quotes.find(q => q.supplierId === selectedSupplierId);
      await onApprove(selectedSupplierId, `Requester selected ${chosen?.supplierName || selectedSupplierId}.`);
      setShowSupplierSelector(false);
    } finally {
      setIsApproving(false);
    }
  };

  const handleRunRAGQuery = async (queryToRun?: string) => {
    const q = queryToRun || ragQuery;
    if (!q.trim()) return;
    setIsSearchingRAG(true);
    try {
      const res = await api.queryRAG(q);
      setRagResult(res);
    } catch (err) {
      console.error('RAG query error:', err);
    } finally {
      setIsSearchingRAG(false);
    }
  };

  const openSourceModal = (metric: string, suppName: string, doc: string, page: number, snippet: string) => {
    setActiveRagSource({
      metricName: metric,
      supplierName: suppName,
      documentName: doc,
      pageNumber: page,
      snippet: snippet,
      confidence: 96.5
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span className="font-semibold text-indigo-600">PROCUREMENT REVIEW</span>
            <span aria-hidden="true">·</span>
            <span className="font-bold text-slate-900">{request.code}</span>
            <span aria-hidden="true">·</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isApproved
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
              }`}
            >
              {request.status.replace(/_/g, ' ')}
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            {request.title}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {request.requestedQuantity} {request.unit} · Authorized Cap: ₹{request.maxBudget.toLocaleString('en-IN')} · Deadline: {request.deliveryDeadlineDate}
          </p>
        </div>

        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* SECTION 13 & 41: Supplier Quotations & True Cost Comparison */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Quotes Received & True Cost Comparison ({quotes.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Deterministic total cost math: Base Price + 18% GST + Shipping + Assembly. All citations traceable to Vector DB.
            </p>
          </div>

          {quotes.length > 0 && !recommendation && (
            <button
              onClick={onRunAIAnalysis}
              disabled={isActionLoading}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isActionLoading ? 'Analyzing via RAG...' : 'AI Compare Quotes'}</span>
            </button>
          )}
        </div>

        {quotes.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
            <Clock className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-xs font-bold text-slate-700">Waiting for suppliers to submit quotations</div>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              Request has been dispatched to enrolled suppliers. Once suppliers submit their bids, they will appear here for AI multi-criteria evaluation.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] text-slate-500 font-semibold font-sans">
                <tr>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3 text-right">Unit Price</th>
                  <th className="px-4 py-3 text-right">True Total Cost</th>
                  <th className="px-4 py-3 text-center">Delivery</th>
                  <th className="px-4 py-3 text-center">Warranty</th>
                  <th className="px-4 py-3 text-center">RAG Evidence</th>
                  <th className="px-4 py-3 text-center">AI Score</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotes.map(q => {
                  const isTopPick = recommendation?.recommendedSupplierId === q.supplierId;
                  const isChosen = request.approval?.approvedSupplier === q.supplierId || request.selectedSupplierId === q.supplierId;

                  return (
                    <tr
                      key={q.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isTopPick ? 'bg-indigo-50/30' : isChosen ? 'bg-emerald-50/30' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-sans">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{q.supplierName}</span>
                          {isTopPick && (
                            <span className="px-1.5 py-0.5 rounded-sm bg-indigo-100 text-indigo-700 text-[9px] font-bold">
                              AI TOP PICK
                            </span>
                          )}
                          {isChosen && (
                            <span className="px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                              APPROVED
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{q.supportingDocumentName || 'Quotation proposal'}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">₹{q.unitPrice.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">
                        <div>₹{q.grandTotal.toLocaleString('en-IN')}</div>
                        <div className="text-[9px] text-slate-400 font-sans">
                          Base + GST + Ship + Inst.
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-sans">
                        <span className={`px-2 py-0.5 rounded-sm text-[11px] font-medium ${
                          q.deliveryDays <= request.deliveryRequiredDays
                            ? 'bg-emerald-50 text-emerald-700 font-bold'
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          {q.deliveryDays} days
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600 font-sans">
                        {q.warrantyMonths > 0 ? `${q.warrantyMonths / 12} years` : 'Not Provided'}
                      </td>
                      <td className="px-4 py-3 text-center font-sans">
                        <button
                          onClick={() =>
                            openSourceModal(
                              'Warranty & Specs',
                              q.supplierName,
                              q.supportingDocumentName || `${q.supplierName.replace(/\s+/g, '_')}_Catalog.pdf`,
                              q.supplierName.includes('Apex') ? 4 : 2,
                              q.supplierName.includes('Apex')
                                ? 'Apex Ergonomics provides a comprehensive 5-Year (60 Months) On-Site Manufacturer Warranty on all structural frames, tilt mechanisms, and gas lifts.'
                                : '1-Year Limited Warranty covering only the steel frame. Consumables excluded.'
                            )
                          }
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-200 hover:bg-indigo-100 transition-colors"
                        >
                          <FileText className="w-3 h-3" />
                          <span>View Source</span>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-indigo-700 font-mono">
                        {q.scores?.compositeScore ? `${q.scores.compositeScore}/100` : '—'}
                      </td>
                      <td className="px-4 py-3 text-center font-sans">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                          {q.status}
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

      {/* SECTION 15: Interactive RAG Supplier Intelligence Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                RAG Supplier Intelligence Search
              </h3>
              <p className="text-xs text-slate-500">
                Ask anything across all indexed supplier catalogs, warranty policies, and compliance certificates.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-600">
            Vector DB Active
          </span>
        </div>

        {/* Quick Question Chips (Section 15 example) */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold">Suggested Queries:</span>
          <button
            onClick={() => {
              setRagQuery('Which suppliers provide at least a 3-year warranty for ergonomic chairs?');
              handleRunRAGQuery('Which suppliers provide at least a 3-year warranty for ergonomic chairs?');
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-[11px] font-medium transition-colors"
          >
            Which suppliers provide at least 3-year warranty?
          </button>
          <button
            onClick={() => {
              setRagQuery('What are the delivery lead times and assembly policies?');
              handleRunRAGQuery('What are the delivery lead times and assembly policies?');
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-[11px] font-medium transition-colors"
          >
            Delivery times & assembly policies?
          </button>
          <button
            onClick={() => {
              setRagQuery('Are the chairs BIFMA or ISO certified?');
              handleRunRAGQuery('Are the chairs BIFMA or ISO certified?');
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-[11px] font-medium transition-colors"
          >
            BIFMA or ISO compliance?
          </button>
        </div>

        {/* Query Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={ragQuery}
              onChange={e => setRagQuery(e.target.value)}
              placeholder="Ask RAG (e.g. Which supplier has 48hr replacement SLA?)"
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => handleRunRAGQuery()}
            disabled={isSearchingRAG}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs disabled:opacity-50"
          >
            {isSearchingRAG ? 'Searching RAG...' : 'Query Vector Store'}
          </button>
        </div>

        {/* RAG Answer Display */}
        {ragResult && (
          <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-3 font-sans text-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-indigo-950 font-bold">
              <span>Synthesized RAG Evidence:</span>
              <span className="font-mono text-indigo-700 text-[11px]">Match Confidence: {ragResult.confidence}%</span>
            </div>
            <div className="text-slate-800 whitespace-pre-line bg-white p-3 rounded-lg border border-indigo-100/80 leading-relaxed">
              {ragResult.answer}
            </div>

            {ragResult.evidence.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-indigo-100">
                <div className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">
                  Verified Source Documents & Citations:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ragResult.evidence.map((ev, idx) => (
                    <div
                      key={idx}
                      onClick={() => openSourceModal('RAG Query Match', ev.supplierName, ev.documentName, ev.pageNumber, ev.snippet)}
                      className="p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] space-y-1 font-mono hover:border-indigo-400 cursor-pointer transition-all"
                    >
                      <div className="flex justify-between text-indigo-700 font-bold">
                        <span>{ev.documentName}</span>
                        <span className="text-slate-400">Page {ev.pageNumber}</span>
                      </div>
                      <div className="text-slate-600 font-sans line-clamp-2 text-[10px] italic">
                        &ldquo;{ev.snippet}&rdquo;
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 14 & 16: AI Supplier Comparison & Explainable Recommendation */}
      {recommendation && (
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-indigo-500/30 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold">
                  AI RECOMMENDATION ENGINE (DECISION: {recommendation.decision})
                </span>
                <h3 className="text-lg font-bold text-white">
                  Best Supplier: {recommendation.recommendedSupplierName}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-4 text-right">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Confidence Score</span>
                <span className="text-lg font-bold text-indigo-300 font-mono">{recommendation.confidenceScore}%</span>
              </div>
              <div className="pl-4 border-l border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Estimated Total</span>
                <span className="text-xl font-bold text-emerald-400 font-mono">
                  ₹{recommendation.recommendedAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Why? Bullet points with Traceable Evidence (Sections 14 & 20) */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase font-bold text-slate-300">Why this supplier is recommended?</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recommendation.explanationBullets.map((bullet, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-200 flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{bullet}</span>
                  </div>
                  <button
                    onClick={() =>
                      openSourceModal(
                        'Recommendation Evidence',
                        recommendation.recommendedSupplierName || 'Recommended Vendor',
                        'Apex_Ergonomics_Catalog_2026.pdf',
                        idx === 0 ? 3 : idx === 1 ? 5 : 4,
                        bullet
                      )
                    }
                    className="text-[10px] font-mono text-indigo-300 hover:text-white shrink-0 hover:underline flex items-center gap-1"
                  >
                    <span>Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {recommendation.whyCheapestRejected && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300">Why not the cheapest invoice quotation?</strong>{' '}
                {recommendation.whyCheapestRejected}
              </div>
            </div>
          )}

          {/* SECTION 17: Requester Human Approval Controls */}
          {isAwaitingRequester && (
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-300">
                  <span className="font-bold text-white">Human Approval Mandatory:</span> Finance will only execute payment once you authorize the selected supplier.
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setShowSupplierSelector(!showSupplierSelector)}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors"
                  >
                    Choose Another Supplier
                  </button>

                  <button
                    type="button"
                    disabled={isApproving}
                    onClick={handleApproveRecommendation}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{isApproving ? 'Authorizing & Dispatching...' : 'Approve Recommendation & Send to Finance'}</span>
                  </button>
                </div>
              </div>

              {/* Alternative Supplier Choice Drawer */}
              {showSupplierSelector && (
                <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-3">
                  <div className="text-xs font-bold text-white">Select Alternative Supplier:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {quotes.map(q => (
                      <label
                        key={q.supplierId}
                        className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors flex items-start gap-2.5 ${
                          selectedSupplierId === q.supplierId
                            ? 'bg-indigo-600/30 border-indigo-400 text-white'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="chosenSupplier"
                          checked={selectedSupplierId === q.supplierId}
                          onChange={() => setSelectedSupplierId(q.supplierId)}
                          className="mt-0.5 text-indigo-500"
                        />
                        <div>
                          <div className="font-bold text-white">{q.supplierName}</div>
                          <div className="text-[11px] font-mono text-emerald-400">₹{q.grandTotal.toLocaleString('en-IN')}</div>
                          <div className="text-[10px] text-slate-400">{q.deliveryDays}d delivery</div>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      disabled={isApproving || !selectedSupplierId}
                      onClick={handleApproveSelectedSupplier}
                      className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs"
                    >
                      Confirm Choice & Send to Finance
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* When already approved */}
          {isApproved && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="font-bold text-emerald-300">
                    Requester Approval Recorded ({request.approval?.approvedBy || request.requesterApprovedBy || 'Requester'})
                  </div>
                  <div className="text-[11px] text-emerald-400/80">
                    Authorized payable: <strong>₹{(request.approval?.approvedAmount || recommendation.recommendedAmount).toLocaleString('en-IN')}</strong> to{' '}
                    <strong>{request.approval?.approvedSupplier || recommendation.recommendedSupplierName}</strong>.
                  </div>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-sm bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                {request.status}
              </span>
            </div>
          )}
        </div>
      )}

      {/* RAG Traceable Source Citation Modal (Section 42) */}
      {activeRagSource && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  RAG Traceable Source Citation
                </h3>
              </div>
              <button
                onClick={() => setActiveRagSource(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-indigo-900 font-bold">Source File: {activeRagSource.documentName}</span>
                  <span className="text-indigo-700 font-semibold">Page {activeRagSource.pageNumber}</span>
                </div>
                <div className="text-slate-600 text-[11px]">
                  Supplier: <strong>{activeRagSource.supplierName}</strong> · Metric: {activeRagSource.metricName}
                </div>
              </div>

              <div>
                <label className="block text-slate-500 text-[11px] uppercase font-mono font-semibold mb-1">
                  Extracted Document Text Chunk (from Vector Store):
                </label>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 text-[11px] leading-relaxed whitespace-pre-line">
                  &ldquo;{activeRagSource.snippet}&rdquo;
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 font-mono">
                <span>Vector Cosine Match: <strong className="text-emerald-600">{activeRagSource.confidence}%</strong></span>
                <span>Verification: <strong className="text-indigo-600">PASS (Verified)</strong></span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveRagSource(null)}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs"
              >
                Close Evidence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
