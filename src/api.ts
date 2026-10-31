import {
  ProcurementRequest,
  InventoryItem,
  Supplier,
  HistoricalPurchase,
  User,
  AppNotification,
  PayPalPaymentRecord,
  AuditLogEntry
} from './types';

export const api = {
  // Auth
  async login(credentials: { email: string; password: string }): Promise<User> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Authentication failed');
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
    const res = await fetch('/api/procurements');
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch procurements');
    return json.data;
  },

  async getProcurementById(id: string): Promise<ProcurementRequest> {
    const res = await fetch(`/api/procurements/${id}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch procurement');
    return json.data;
  },

  async createProcurement(payload: Partial<ProcurementRequest>): Promise<ProcurementRequest> {
    const res = await fetch('/api/procurements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to create procurement');
    return json.data;
  },

  async updateUnderstanding(id: string, updates: any): Promise<ProcurementRequest> {
    const res = await fetch(`/api/procurements/${id}/update-understanding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update understanding');
    return json.data;
  },

  async addQuote(id: string, quoteData: any): Promise<ProcurementRequest> {
    const res = await fetch(`/api/procurements/${id}/quotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quoteData)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to add quote');
    return json.data;
  },

  async runAIAnalysis(id: string): Promise<ProcurementRequest> {
    const res = await fetch(`/api/procurements/${id}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to execute AI analysis');
    return json.data;
  },

  // Approvals
  async getApprovals(): Promise<ProcurementRequest[]> {
    const res = await fetch('/api/approvals');
    const json = await res.json();
    return json.data || [];
  },

  async submitApproval(id: string, decision: 'APPROVE' | 'REJECT' | 'CHANGES', note: string, approverName: string): Promise<ProcurementRequest> {
    const res = await fetch(`/api/approvals/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, note, approverName })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to record approval');
    return json.data;
  },

  // Payments (PayPal Sandbox)
  async createPayPalOrder(id: string, supplierId: string, amount: number, approverRole: string = 'FINANCE_APPROVER'): Promise<{ orderId: string; approvalUrl: string; isSimulated: boolean }> {
    const res = await fetch(`/api/payments/paypal/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ procurementId: id, supplierId, amount, currency: 'INR', approverRole })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || (json.details ? json.details.join(' ') : 'Payment authorization failed'));
    return json.data;
  },

  async capturePayPalPayment(id: string, orderId: string, approverName: string): Promise<ProcurementRequest> {
    const res = await fetch(`/api/payments/paypal/capture-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ procurementId: id, orderId, approverName })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Payment capture failed');
    return json.data;
  },

  async getPayments(): Promise<PayPalPaymentRecord[]> {
    const res = await fetch('/api/payments');
    const json = await res.json();
    return json.data || [];
  },

  // Inventory, Suppliers, Notifications, Audit
  async getInventory(): Promise<InventoryItem[]> {
    const res = await fetch('/api/inventory');
    const json = await res.json();
    return json.data || [];
  },

  async updateInventory(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    const res = await fetch(`/api/inventory/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const json = await res.json();
    return json.data;
  },

  async getSuppliers(): Promise<Supplier[]> {
    const res = await fetch('/api/suppliers');
    const json = await res.json();
    return json.data || [];
  },

  async getSupplierById(id: string): Promise<Supplier> {
    const res = await fetch(`/api/suppliers/${id}`);
    const json = await res.json();
    return json.data;
  },

  async getHistory(): Promise<HistoricalPurchase[]> {
    const res = await fetch('/api/history');
    const json = await res.json();
    return json.data || [];
  },

  async getNotifications(role?: string): Promise<AppNotification[]> {
    const url = role ? `/api/notifications?role=${role}` : '/api/notifications';
    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
  },

  async markNotificationRead(id: string): Promise<void> {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
  },

  async getAuditLogs(): Promise<AuditLogEntry[]> {
    const res = await fetch('/api/audit');
    const json = await res.json();
    return json.data || [];
  },

  async resetDemo(): Promise<ProcurementRequest> {
    const res = await fetch('/api/demo/reset', { method: 'POST' });
    const json = await res.json();
    return json.data;
  }
};
