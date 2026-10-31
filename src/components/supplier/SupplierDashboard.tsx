import React, { useState, useEffect, useRef } from 'react';
import { ProcurementRequest, User, SupplierDocumentRecord, RAGAnswerResponse } from '../../types';
import {
  Store,
  FileText,
  CheckCircle2,
  Clock,
  DollarSign,
  ArrowRight,
  Wallet,
  ShieldCheck,
  Tag,
  Upload,
  Database,
  Trash2,
  Search,
  Sparkles,
  AlertCircle,
  FileCheck2,
  Plus,
  RefreshCw,
  X,
  FileUp,
  RotateCcw,
  Eye
} from 'lucide-react';
import { api } from '../../api';

interface SupplierDashboardProps {
  requests: ProcurementRequest[];
  currentUser: User;
  onSelectRFQ: (id: string) => void;
}

export type DocumentTypeOption =
  | 'CATALOG'
  | 'QUOTATION'
  | 'PRICE_LIST'
  | 'WARRANTY'
  | 'SPECIFICATION'
  | 'DELIVERY_POLICY'
  | 'CERTIFICATION'
  | 'OTHER';

export const SupplierDashboard: React.FC<SupplierDashboardProps> = ({
  requests,
  currentUser,
  onSelectRFQ
}) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'documents' | 'orders'>('requests');
  const [documents, setDocuments] = useState<SupplierDocumentRecord[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Real File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<DocumentTypeOption>('CATALOG');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    'IDLE' | 'UPLOADING' | 'EXTRACTING' | 'CHUNKING' | 'EMBEDDING' | 'INDEXING' | 'SUCCESS' | 'FAILED'
  >('IDLE');
  const [uploadError, setUploadError] = useState('');
  const [previewDoc, setPreviewDoc] = useState<SupplierDocumentRecord | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // RAG Test Search State
  const [ragQuery, setRagQuery] = useState('');
  const [ragResult, setRagResult] = useState<RAGAnswerResponse | null>(null);
  const [isSearchingRAG, setIsSearchingRAG] = useState(false);

  const supplierId = currentUser.supplierId || 'supp_01';

  const isSupplierMatch = (suppId?: string, suppName?: string) => {
    if (currentUser.supplierId && suppId === currentUser.supplierId) return true;
    if (currentUser.companyName && suppName && suppName.toLowerCase().includes(currentUser.companyName.toLowerCase())) return true;
    return false;
  };

  const loadDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const docs = await api.getSupplierDocuments(supplierId);
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to load supplier documents:', err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [supplierId]);

  // Metrics
  const myQuotes = requests.flatMap(r => r.quotes || []).filter(q => isSupplierMatch(q.supplierId, q.supplierName));
  const myAcceptedRequests = requests.filter(r =>
    (r.status === 'AWAITING_FINANCE' || r.status === 'APPROVED' || r.status === 'PAYMENT_PENDING' || r.status === 'PAID') &&
    (isSupplierMatch(r.approval?.approvedSupplier) || isSupplierMatch(r.recommendation?.recommendedSupplierId, r.recommendation?.recommendedSupplierName))
  );
  const myPaidRequests = requests.filter(r =>
    r.status === 'PAID' &&
    (isSupplierMatch(r.approval?.approvedSupplier) || isSupplierMatch(r.recommendation?.recommendedSupplierId, r.recommendation?.recommendedSupplierName))
  );
  const pendingQuoteRequests = requests.filter(r =>
    !r.quotes?.some(q => isSupplierMatch(q.supplierId, q.supplierName))
  );
  const totalReceivedAmount = myPaidRequests.reduce((acc, r) => {
    const amt = r.approval?.approvedAmount || r.recommendation?.recommendedAmount || 0;
    return acc + amt;
  }, 0);

  // Auto-detect Document Type from filename
  const detectDocumentType = (filename: string): DocumentTypeOption => {
    const lower = filename.toLowerCase();
    if (lower.includes('quote') || lower.includes('quotation') || lower.includes('proposal') || lower.includes('bid')) {
      return 'QUOTATION';
    }
    if (lower.includes('price') || lower.includes('rate') || lower.includes('pricing') || lower.includes('cost')) {
      return 'PRICE_LIST';
    }
    if (lower.includes('warranty') || lower.includes('guarantee')) {
      return 'WARRANTY';
    }
    if (lower.includes('catalog') || lower.includes('catalogue') || lower.includes('brochure')) {
      return 'CATALOG';
    }
    if (lower.includes('spec') || lower.includes('datasheet') || lower.includes('technical')) {
      return 'SPECIFICATION';
    }
    if (lower.includes('delivery') || lower.includes('shipping') || lower.includes('dispatch') || lower.includes('sla')) {
      return 'DELIVERY_POLICY';
    }
    if (lower.includes('cert') || lower.includes('iso') || lower.includes('bifma') || lower.includes('license')) {
      return 'CERTIFICATION';
    }
    return 'OTHER';
  };

  const handleFileSelect = (file: File) => {
    setUploadError('');
    // Validation
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    const validExts = ['.pdf', '.docx', '.csv', '.txt', '.png', '.jpg', '.jpeg'];
    if (!validExts.includes(ext)) {
      setUploadError('Unsupported file type. Please upload PDF, DOCX, CSV, TXT, PNG, or JPG.');
      return;
    }
    const maxBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxBytes) {
      setUploadError('File exceeds maximum allowed size of 10 MB.');
      return;
    }

    setSelectedFile(file);
    const suggested = detectDocumentType(file.name);
    setDocType(suggested);
  };

  const handleRealUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please choose or drag-and-drop a document file to upload.');
      return;
    }

    setUploadError('');
    setUploadStatus('UPLOADING');

    try {
      // Step transitions to give real feedback
      setTimeout(() => setUploadStatus('EXTRACTING'), 300);
      setTimeout(() => setUploadStatus('CHUNKING'), 700);
      setTimeout(() => setUploadStatus('EMBEDDING'), 1100);
      setTimeout(() => setUploadStatus('INDEXING'), 1500);

      const res = await api.uploadSupplierFile(selectedFile, docType, 'Office Furniture');

      setUploadStatus('SUCCESS');
      await loadDocuments();

      setTimeout(() => {
        setIsUploadOpen(false);
        setSelectedFile(null);
        setUploadStatus('IDLE');
      }, 1400);
    } catch (err: any) {
      setUploadStatus('FAILED');
      setUploadError(err.message || 'File upload and indexing failed.');
    }
  };

  const handleReindexDocument = async (id: string) => {
    try {
      await api.reindexSupplierDocument(id);
      await loadDocuments();
      alert('Document re-indexed into Supplier Vector DB successfully.');
    } catch (err: any) {
      alert(err.message || 'Re-indexing failed.');
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document from the Vector Database?')) return;
    try {
      await api.deleteSupplierDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (err: any) {
      alert(err.message || 'Could not delete document');
    }
  };

  const handleRunRAGSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ragQuery.trim()) return;
    setIsSearchingRAG(true);
    try {
      const res = await api.queryRAG(ragQuery, { supplierId });
      setRagResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingRAG(false);
    }
  };

  const loadSampleDocument = (type: 'WARRANTY' | 'CATALOG') => {
    const filename = type === 'WARRANTY' ? 'Official_Warranty_Policy_2026.txt' : 'Product_Catalog_Commercial_Duty.txt';
    const content = type === 'WARRANTY'
      ? `Official Enterprise Warranty Policy - ${currentUser.companyName || 'Apex Ergonomics'}.\nWarranty Duration: 5-Year (60 Months) Comprehensive On-Site Manufacturer Warranty.\nCoverage: Full coverage for synchronized tilt mechanism, Class 4 gas lift cylinder, five-prong base, and mesh frame.\nDefective Component Replacement SLA: Within 48 hours for metro locations. Zero labor charges.`
      : `Executive Ergonomic Task Seating Specifications.\nBIFMA X5.1-2017 compliant commercial duty rated for 24/7 continuous operations.\nWeight capacity: 160 kg.\nPricing tier for 100 units: ₹1,850 per unit. Statutory GST 18%.\nFree metro shipping included on volume orders exceeding 50 units.`;

    const blob = new Blob([content], { type: 'text/plain' });
    const file = new File([blob], filename, { type: 'text/plain' });
    handleFileSelect(file);
    setIsUploadOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase">
            <span>Supplier Portal</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-amber-600 font-sans">Verified Vendor</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Hello, {currentUser.companyName || currentUser.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your incoming RFQs, RAG knowledge documents, active quotes, and settled orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('documents');
              setIsUploadOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-xs"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document to RAG</span>
          </button>
        </div>
      </div>

      {/* 5 Dynamic Metric Cards (Section 5 Requirement) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>New Requests</span>
            <FileText className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {requests.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Assigned to catalog</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pending Quotes</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2 font-mono">
            {pendingQuoteRequests.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Awaiting submission</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Submitted Quotes</span>
            <Tag className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {myQuotes.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Commercial proposals</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Accepted Orders</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2 font-mono">
            {myAcceptedRequests.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Requester approved</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Payments</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2 font-mono truncate">
            ₹{totalReceivedAmount.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Settled via PayPal</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200 pt-2">
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-2.5 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'requests'
              ? 'border-amber-500 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Procurement Requests ({requests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`pb-2.5 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'documents'
              ? 'border-amber-500 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Supplier Document Center & RAG ({documents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-2.5 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'orders'
              ? 'border-amber-500 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Confirmed Orders & PayPal Settlements ({myAcceptedRequests.length})</span>
        </button>
      </div>

      {/* Tab 1: Requests Pipeline */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-0">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Assigned Procurement Requests</h2>
            <span className="text-xs text-slate-400 font-mono">Live Bidding Pipeline</span>
          </div>

          {requests.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No active procurement requests assigned to your catalog right now.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-semibold font-sans">
                  <tr>
                    <th className="px-6 py-3.5">Request ID</th>
                    <th className="px-6 py-3.5">Item & Specifications</th>
                    <th className="px-6 py-3.5 text-center">Required Qty</th>
                    <th className="px-6 py-3.5 text-right">Budget Cap</th>
                    <th className="px-6 py-3.5 text-center">Delivery Window</th>
                    <th className="px-6 py-3.5 text-center">My Quote Status</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.map(r => {
                    const myQuote = r.quotes?.find(q => isSupplierMatch(q.supplierId, q.supplierName));
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">{r.code}</td>
                        <td className="px-6 py-4 font-sans">
                          <div className="font-bold text-slate-900">{r.title}</div>
                          <div className="text-slate-500 text-[11px] truncate max-w-xs">{r.productService} · {r.category}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold">
                            {r.requestedQuantity} {r.unit}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-900">
                          ₹{r.maxBudget.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-center font-sans">
                          <span className="text-slate-700">{r.deliveryRequiredDays} Days</span>
                          <div className="text-[10px] text-slate-400 font-mono">{r.deliveryDeadlineDate}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {myQuote ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              ₹{myQuote.grandTotal.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Quote Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => onSelectRFQ(r.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-all shadow-xs"
                          >
                            <span>{myQuote ? 'View / Edit Quote' : 'Submit Quote'}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Supplier Document Center & RAG (Sections 43 & 44) */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          {/* Document Center Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-bold text-slate-900">Product Catalogs</div>
              <p className="text-[11px] text-slate-500 mt-1">Full pricing, models & dimensional specs.</p>
              <button
                onClick={() => {
                  setDocType('CATALOG');
                  setIsUploadOpen(true);
                }}
                className="mt-3 text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Upload Catalog</span>
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-bold text-slate-900">Warranty Policies</div>
              <p className="text-[11px] text-slate-500 mt-1">SLA, replacement terms & parts coverage.</p>
              <button
                onClick={() => {
                  setDocType('WARRANTY');
                  setIsUploadOpen(true);
                }}
                className="mt-3 text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Upload Warranty Doc</span>
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-bold text-slate-900">Certifications</div>
              <p className="text-[11px] text-slate-500 mt-1">BIFMA, ISO 9001, test lab certificates.</p>
              <button
                onClick={() => {
                  setDocType('CERTIFICATION');
                  setIsUploadOpen(true);
                }}
                className="mt-3 text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Upload Certificate</span>
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-bold text-slate-900">Price Lists & Quotes</div>
              <p className="text-[11px] text-slate-500 mt-1">Volume discount tiers and commercial rate cards.</p>
              <button
                onClick={() => {
                  setDocType('PRICE_LIST');
                  setIsUploadOpen(true);
                }}
                className="mt-3 text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Upload Price List</span>
              </button>
            </div>
          </div>

          {/* Ingested Documents Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Ingested RAG Knowledge Documents</h2>
                <p className="text-xs text-slate-500">
                  Documents are automatically chunked, embedded, and stored in the Vector Database for AI retrieval.
                </p>
              </div>
              <button
                onClick={loadDocuments}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                title="Refresh Documents"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingDocs ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {documents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No documents uploaded yet. Click &quot;Upload Document to RAG&quot; above to build your supplier knowledge base.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-semibold font-sans">
                    <tr>
                      <th className="px-6 py-3.5">Document</th>
                      <th className="px-6 py-3.5">Type</th>
                      <th className="px-6 py-3.5 text-right">Size</th>
                      <th className="px-6 py-3.5 text-center">Status</th>
                      <th className="px-6 py-3.5 text-center">Chunks</th>
                      <th className="px-6 py-3.5 text-center">Uploaded</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {documents.map(d => (
                      <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-sans font-bold text-slate-900 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span className="truncate max-w-xs" title={d.filename}>{d.filename}</span>
                        </td>
                        <td className="px-6 py-4 font-sans">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                            {d.documentType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-sans text-slate-600">
                          {d.fileSizeBytes ? `${Math.round(d.fileSizeBytes / 1024)} KB` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              d.extractionStatus === 'PROCESSED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : d.extractionStatus === 'FAILED'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {d.extractionStatus === 'PROCESSED' ? 'Processed' : d.extractionStatus === 'FAILED' ? 'Failed' : d.extractionStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-indigo-700">
                          {d.totalChunks}
                        </td>
                        <td className="px-6 py-4 text-center font-sans text-slate-500">
                          {new Date(d.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right font-sans">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setPreviewDoc(d)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                              title="View Document Details & Chunks"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleReindexDocument(d.id)}
                              className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                              title="Re-index Document"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteDocument(d.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Delete document and vector chunks"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Test Vector RAG Search */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Test Vector DB RAG Retrieval
                </h3>
                <p className="text-[11px] text-slate-400">
                  Verify how ProcurePilot AI retrieves and cites evidence from your uploaded documents.
                </p>
              </div>
            </div>

            <form onSubmit={handleRunRAGSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={ragQuery}
                  onChange={e => setRagQuery(e.target.value)}
                  placeholder="e.g. What is the warranty period and delivery lead time?"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <button
                type="submit"
                disabled={isSearchingRAG}
                className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all disabled:opacity-50"
              >
                {isSearchingRAG ? 'Searching Vector DB...' : 'Search RAG'}
              </button>
            </form>

            {ragResult && (
              <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl space-y-3 font-sans text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold text-white">Synthesized RAG Answer:</span>
                  <span className="font-mono text-emerald-400">Confidence: {ragResult.confidence}%</span>
                </div>
                <div className="text-slate-200 whitespace-pre-line bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
                  {ragResult.answer}
                </div>

                {ragResult.evidence.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-700">
                    <div className="text-[11px] text-slate-400 uppercase font-mono tracking-wider">
                      Retrieved Vector Chunks & Sources:
                    </div>
                    {ragResult.evidence.map((ev, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-900/40 rounded-lg border border-slate-800 text-[11px] space-y-1 font-mono">
                        <div className="flex justify-between text-amber-300 font-semibold">
                          <span>Source: {ev.documentName} (Page {ev.pageNumber})</span>
                          <span className="text-slate-400">Similarity: {(ev.score * 100).toFixed(1)}%</span>
                        </div>
                        <div className="text-slate-300 font-sans italic">&ldquo;{ev.snippet}&rdquo;</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Confirmed Orders & PayPal Settlements (Section 26 Requirement) */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-0">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Awarded Purchase Orders & PayPal Settlements</h2>
            <span className="text-xs text-slate-400 font-mono">Authoritative Ledger</span>
          </div>

          {myAcceptedRequests.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No purchase orders awarded to your profile yet. Submit quotes above to win contracts.
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {myAcceptedRequests.map(r => {
                const isPaid = r.status === 'PAID';
                const finalAmount = r.approval?.approvedAmount || r.recommendation?.recommendedAmount || 0;
                return (
                  <div
                    key={r.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 transition-all hover:bg-slate-50"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-900">{r.code}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isPaid
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {isPaid ? 'PAID & SETTLED' : 'ORDER CONFIRMED (Awaiting Payment Capture)'}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mt-1">{r.title}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500">Total Settlement Value</div>
                        <div className="text-lg font-bold font-mono text-emerald-600">
                          ₹{finalAmount.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 font-sans block text-[11px]">Allocated Units</span>
                        <span className="font-bold text-slate-900">
                          {r.recommendation?.recommendedQuantity || r.requestedQuantity} {r.unit}
                        </span>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 font-sans block text-[11px]">Delivery Deadline</span>
                        <span className="text-slate-800">{r.deliveryDeadlineDate}</span>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 font-sans block text-[11px]">Payment Method</span>
                        <span className="text-slate-800">PayPal Sandbox Orders v2</span>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-400 font-sans block text-[11px]">Transaction ID</span>
                        <span className="text-indigo-600 font-bold truncate block">
                          {r.payment?.captureId || (isPaid ? 'PAYPAL-CAPTURED' : 'PENDING_CAPTURE')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Real Document Upload Modal (Sections 1-24) */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>Upload Document to Supplier Knowledge Base</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  if (uploadStatus === 'IDLE' || uploadStatus === 'SUCCESS' || uploadStatus === 'FAILED') {
                    setIsUploadOpen(false);
                    setSelectedFile(null);
                    setUploadStatus('IDLE');
                    setUploadError('');
                  }
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleRealUploadDocument} className="space-y-4 text-xs">
              {/* Drag and Drop File Upload Area */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">Upload File</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.csv,.txt,.png,.jpg,.jpeg,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/csv,text/plain,image/png,image/jpeg"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                />

                <div
                  onDragOver={e => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={e => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-indigo-500 bg-indigo-50/60 scale-[1.01]'
                      : selectedFile
                      ? 'border-emerald-300 bg-emerald-50/30'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
                      <FileUp className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-slate-800 font-medium">
                        Drag &amp; drop your document here
                      </p>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        or <span className="text-indigo-600 font-bold hover:underline">Choose File</span>
                      </p>
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans tracking-wide pt-1">
                      PDF, DOCX, CSV, TXT, PNG, JPG &bull; Maximum 10 MB
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Type Dropdown */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">Document Type</label>
                <select
                  value={docType}
                  onChange={e => setDocType(e.target.value as DocumentTypeOption)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="CATALOG">Product Catalog</option>
                  <option value="QUOTATION">Quotation</option>
                  <option value="PRICE_LIST">Price List</option>
                  <option value="WARRANTY">Warranty Policy</option>
                  <option value="SPECIFICATION">Product Specification</option>
                  <option value="DELIVERY_POLICY">Delivery Policy</option>
                  <option value="CERTIFICATION">Certification</option>
                  <option value="OTHER">Other</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Type auto-detected from filename; adjust if needed.
                </p>
              </div>

              {/* Selected File Card */}
              {selectedFile && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 max-w-[200px] truncate" title={selectedFile.name}>
                        {selectedFile.name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {selectedFile.name.split('.').pop()?.toUpperCase()} &bull;{' '}
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Ready
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="text-[11px] text-slate-400 hover:text-rose-600 font-medium ml-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              {/* Real Progress State */}
              {uploadStatus !== 'IDLE' && uploadStatus !== 'FAILED' && (
                <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-indigo-900">
                    <span className="flex items-center gap-2">
                      {uploadStatus === 'SUCCESS' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
                      )}
                      <span>
                        {uploadStatus === 'UPLOADING' && 'Uploading document...'}
                        {uploadStatus === 'EXTRACTING' && 'Extracting document text...'}
                        {uploadStatus === 'CHUNKING' && 'Creating knowledge chunks...'}
                        {uploadStatus === 'EMBEDDING' && 'Generating embeddings...'}
                        {uploadStatus === 'INDEXING' && 'Indexing in Supplier Knowledge Base...'}
                        {uploadStatus === 'SUCCESS' && '✓ Document successfully indexed'}
                      </span>
                    </span>
                    <span className="text-[10px] font-mono text-indigo-600 font-bold">
                      {uploadStatus === 'UPLOADING' && '20%'}
                      {uploadStatus === 'EXTRACTING' && '40%'}
                      {uploadStatus === 'CHUNKING' && '65%'}
                      {uploadStatus === 'EMBEDDING' && '85%'}
                      {uploadStatus === 'INDEXING' && '95%'}
                      {uploadStatus === 'SUCCESS' && '100%'}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-indigo-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        uploadStatus === 'SUCCESS' ? 'bg-emerald-500' : 'bg-indigo-600'
                      }`}
                      style={{
                        width:
                          uploadStatus === 'UPLOADING'
                            ? '20%'
                            : uploadStatus === 'EXTRACTING'
                            ? '40%'
                            : uploadStatus === 'CHUNKING'
                            ? '65%'
                            : uploadStatus === 'EMBEDDING'
                            ? '85%'
                            : uploadStatus === 'INDEXING'
                            ? '95%'
                            : '100%'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadOpen(false);
                    setSelectedFile(null);
                    setUploadStatus('IDLE');
                    setUploadError('');
                  }}
                  disabled={uploadStatus !== 'IDLE' && uploadStatus !== 'FAILED'}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile || (uploadStatus !== 'IDLE' && uploadStatus !== 'FAILED')}
                  className="px-5 py-2 font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                  <span>
                    {uploadStatus === 'IDLE' || uploadStatus === 'FAILED'
                      ? 'Upload & Index'
                      : 'Processing...'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Details & Chunks Inspection Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>{previewDoc.filename}</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  ID: <span className="font-mono">{previewDoc.id}</span> &bull; {previewDoc.documentType}
                </p>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[10px] block">Status</span>
                <span className="font-bold text-emerald-600">{previewDoc.extractionStatus}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[10px] block">Vector Chunks</span>
                <span className="font-bold text-indigo-600">{previewDoc.totalChunks} Chunks</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[10px] block">Storage</span>
                <span className="font-bold text-slate-700">
                  {previewDoc.fileSizeBytes ? `${(previewDoc.fileSizeBytes / 1024).toFixed(1)} KB` : 'N/A'}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono space-y-1">
              <div className="text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                Vector Knowledge Base Metadata:
              </div>
              <div className="text-[11px] text-slate-300">
                Supplier ID: {previewDoc.supplierId}
              </div>
              <div className="text-[11px] text-slate-300">
                MIME Type: {previewDoc.fileType}
              </div>
              <div className="text-[11px] text-slate-300">
                Indexed: {new Date(previewDoc.createdAt).toLocaleString()}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
