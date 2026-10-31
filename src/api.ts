import {
  ProcurementRequest,
  InventoryItem,
  Supplier,
  HistoricalPurchase,
  User,
  AppNotification,
  PayPalPaymentRecord,
  AuditLogEntry,
  SupplierQuote,
  SupplierDocumentRecord,
  RAGAnswerResponse
} from './types';

function getToken(): string | null {
  return localStorage.getItem('procurepilot_token');
}

function setToken(token: string): void {
  localStorage.setItem('procurepilot_token', token);
}

function clearToken(): void {
  localStorage.removeItem('procurepilot_token');
}

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(url, { ...options, headers });
}

async function parseJson<T = any>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  const text = await res.text();
  throw new Error(`Server returned non-JSON (${res.status}): ${text.substring(0, 80)}`);
}

export const api = {
  getToken,
  setToken,
  clearToken,

  // Auth
  async login(credentials: { email: string; password: string }): Promise<User> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Authentication failed');
    if (json.token) setToken(json.token);
    return json.data;
  },

  async register(data: { name: string; companyName: string; email: string; password: string; role: string }): Promise<User> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Registration failed');
    if (json.token) setToken(json.token);
    return json.data;
  },

  async registerSupplier(data: {
    companyName: string;
    contactPerson: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    products?: string;
    category?: string;
    description?: string;
    gstNumber?: string;
    website?: string;
  }): Promise<{ user: User; supplier: any }> {
    const res = await fetch('/api/auth/register-supplier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await parseJson(res);
    if (!json.success) throw new Error(json.error || 'Supplier registration failed');
    if (json.token) setToken(json.token);
    return { user: json.data, supplier: json.supplier };
  },

  async getMe(): Promise<User> {
    const res = await authFetch('/api/auth/me');
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to authenticate current user');
    return json.data;
  },

  async forgotPassword(email: string): Promise<{ message: string; demoResetToken?: string }> {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Recovery request failed');
    return json;
  },

  async resetPassword(data: { token?: string; email?: string; newPassword: string }): Promise<void> {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Password reset failed');
  },

  // Procurements
  async getProcurements(): Promise<ProcurementRequest[]> {
    const res = await authFetch('/api/procurements');
    const json = await parseJson(res);
    if (!json.success) throw new Error(json.error || 'Failed to fetch procurements');
    return json.data;
  },

  async getProcurementById(id: string): Promise<ProcurementRequest> {
    const res = await authFetch(`/api/procurements/${id}`);
    const json = await parseJson(res);
    if (!json.success) throw new Error(json.error || 'Failed to fetch procurement');
    return json.data;
  },

  async createProcurement(payload: Partial<ProcurementRequest>): Promise<ProcurementRequest> {
    const res = await authFetch('/api/procurements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to create procurement');
    return json.data;
  },

  async updateUnderstanding(id: string, updates: any): Promise<ProcurementRequest> {
    const res = await authFetch(`/api/procurements/${id}/update-understanding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update understanding');
    return json.data;
  },

  async addQuote(id: string, quoteData: any): Promise<ProcurementRequest> {
    const res = await authFetch(`/api/procurements/${id}/quotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quoteData)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to add quote');
    return json.data;
  },

  async uploadQuote(payload: {
    requestId: string;
    supplierName: string;
    rawText: string;
    fileName?: string;
    targetQuantity?: number;
  }): Promise<{ quote: SupplierQuote; request: ProcurementRequest }> {
    const res = await authFetch('/api/quotes/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to extract quotation facts');
    return { quote: json.data, request: json.request };
  },

  async runAIAnalysis(id: string): Promise<ProcurementRequest> {
    const res = await authFetch(`/api/procurements/${id}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const json = await parseJson(res);
    if (!json.success) throw new Error(json.error || 'Failed to execute AI analysis');
    return json.data;
  },

  async understandRequirement(text: string): Promise<any> {
    const res = await authFetch('/api/procurements/understand', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    const json = await parseJson(res);
    if (!json.success) throw new Error(json.error || 'Failed to analyze requirement text');
    return json.data;
  },

  async requesterApprove(id: string, payload: { supplierId: string; note?: string }): Promise<ProcurementRequest> {
    const res = await authFetch(`/api/procurements/${id}/requester-approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await parseJson(res);
    if (!json.success) throw new Error(json.error || 'Failed to approve recommendation');
    return json.data;
  },

  // Approvals
  async getApprovals(): Promise<ProcurementRequest[]> {
    const res = await authFetch('/api/approvals');
    const json = await res.json();
    return json.data || [];
  },

  async submitApproval(id: string, decision: 'APPROVE' | 'REJECT' | 'CHANGES', note: string, approverName?: string): Promise<ProcurementRequest> {
    const res = await authFetch(`/api/approvals/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, note, approverName })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to record approval');
    return json.data;
  },

  // Payments (PayPal Sandbox)
  async getPayPalConfig(): Promise<{ clientId: string; currency: string }> {
    const res = await fetch('/api/config/paypal');
    const json = await res.json();
    return json;
  },

  async createPayPalOrder(id: string, supplierId?: string, amount?: number, approverRole: string = 'FINANCE_APPROVER'): Promise<{
    orderId: string;
    approvalUrl: string;
    amount: number;
    convertedAmount: number;
    convertedCurrency: string;
    supplierName: string;
  }> {
    const res = await authFetch(`/api/payments/paypal/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ procurementId: id, supplierId, amount, currency: 'INR', approverRole })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || (json.details ? json.details.join(' ') : 'Payment authorization failed'));
    return json.data || { orderId: json.order_id };
  },

  async capturePayPalPayment(id: string, orderId: string, approverName?: string): Promise<{ success: boolean; data: ProcurementRequest; payment: PayPalPaymentRecord }> {
    const res = await authFetch(`/api/payments/paypal/capture-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ procurementId: id, orderId, approverName })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Payment capture failed');
    return json;
  },

  async getPayments(): Promise<PayPalPaymentRecord[]> {
    const res = await authFetch('/api/payments');
    const json = await parseJson(res);
    return json.data || [];
  },

  // Supplier Documents & Vector DB RAG
  async getSupplierDocuments(supplierId?: string): Promise<SupplierDocumentRecord[]> {
    const url = supplierId ? `/api/documents?supplierId=${encodeURIComponent(supplierId)}` : '/api/documents';
    const res = await authFetch(url);
    const json = await parseJson(res);
    return json.data || [];
  },

  /**
   * Real multipart/form-data document upload to Supplier Vector DB
   */
  async uploadSupplierFile(
    file: File,
    documentType: string,
    category?: string
  ): Promise<SupplierDocumentRecord & { structuredQuote?: any; pageCount?: number; extractionMethod?: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    if (category) formData.append('category', category);

    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/suppliers/documents/upload', {
      method: 'POST',
      headers,
      body: formData
    });

    const json = await parseJson(res);
    if (!json.success) throw new Error(json.error || 'Failed to upload and index document');
    return json.data;
  },

  async reindexSupplierDocument(id: string): Promise<SupplierDocumentRecord> {
    const res = await authFetch(`/api/documents/${id}/reindex`, {
      method: 'POST'
    });
    const json = await parseJson(res);
    if (!json.success) throw new Error(json.error || 'Failed to re-index document');
    return json.data;
  },

  async uploadSupplierDocument(data: {
    supplierId?: string;
    supplierName?: string;
    filename: string;
    fileType?: string;
    documentType: string;
    category?: string;
    rawContent: string;
  }): Promise<SupplierDocumentRecord> {
    const res = await authFetch('/api/documents/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await parseJson(res);
    if (!json.success) throw new Error(json.error || 'Failed to ingest document');
    return json.data;
  },

  async deleteSupplierDocument(id: string): Promise<void> {
    const res = await authFetch(`/api/documents/${id}`, {
      method: 'DELETE'
    });
    const json = await parseJson(res);
    if (!json.success) throw new Error(json.error || 'Failed to delete document');
  },

  async queryRAG(question: string, options?: { supplierId?: string; category?: string; topK?: number }): Promise<RAGAnswerResponse> {
    const res = await authFetch('/api/rag/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, ...options })
    });
    const json = await parseJson(res);
    if (!json.success) throw new Error(json.error || 'RAG query failed');
    return json.data;
  },

  // Analytics
  async getAnalytics(): Promise<any> {
    const res = await authFetch('/api/analytics');
    const json = await parseJson(res);
    if (!json.success) throw new Error(json.error || 'Failed to fetch analytics');
    return json.data;
  },

  // Inventory, Suppliers, Notifications, Audit
  async getInventory(): Promise<InventoryItem[]> {
    const res = await authFetch('/api/inventory');
    const json = await parseJson(res);
    return json.data || [];
  },

  async updateInventory(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    const res = await authFetch(`/api/inventory/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const json = await parseJson(res);
    return json.data;
  },

  async getSuppliers(): Promise<Supplier[]> {
    const res = await authFetch('/api/suppliers');
    const json = await parseJson(res);
    return json.data || [];
  },

  async getSupplierById(id: string): Promise<Supplier> {
    const res = await authFetch(`/api/suppliers/${id}`);
    const json = await parseJson(res);
    return json.data;
  },

  async getHistory(): Promise<HistoricalPurchase[]> {
    const res = await authFetch('/api/history');
    const json = await parseJson(res);
    return json.data || [];
  },

  async getNotifications(role?: string): Promise<AppNotification[]> {
    const url = role ? `/api/notifications?role=${encodeURIComponent(role)}` : '/api/notifications';
    const res = await authFetch(url);
    const json = await parseJson(res);
    return json.data || [];
  },

  async markNotificationRead(id: string): Promise<void> {
    await authFetch(`/api/notifications/${id}/read`, { method: 'POST' });
  },

  async getAuditLogs(): Promise<AuditLogEntry[]> {
    const res = await authFetch('/api/audit');
    const json = await parseJson(res);
    return json.data || [];
  },

  async resetDemo(): Promise<ProcurementRequest> {
    const res = await authFetch('/api/demo/reset', { method: 'POST' });
    const json = await parseJson(res);
    return json.data;
  }
};
