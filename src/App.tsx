import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { CompanyDashboard } from './components/company/CompanyDashboard';
import { CreateProcurementPage } from './components/company/CreateProcurementPage';
import { SupplierComparisonPage } from './components/company/SupplierComparisonPage';
import { CompanyAnalyticsPage } from './components/company/CompanyAnalyticsPage';
import { ProcurementDetailView } from './components/ProcurementDetailView';
import { InventoryView } from './components/InventoryView';
import { FinanceDashboard } from './components/finance/FinanceDashboard';
import { FinanceApprovalPage } from './components/finance/FinanceApprovalPage';
import { FinancePaymentsPage } from './components/finance/FinancePaymentsPage';
import { FinanceReportsPage } from './components/finance/FinanceReportsPage';
import { FinanceAuditPage } from './components/finance/FinanceAuditPage';
import { SupplierDashboard } from './components/supplier/SupplierDashboard';
import { SupplierQuotationPage } from './components/supplier/SupplierQuotationPage';
import { NotificationsDrawer } from './components/common/NotificationsDrawer';
import { ProfileSettingsPage } from './components/common/ProfileSettingsPage';
import { api } from './api';
import {
  ProcurementRequest,
  InventoryItem,
  Supplier,
  HistoricalPurchase,
  User,
  UserRole,
  AppNotification,
  PayPalPaymentRecord,
  AuditLogEntry
} from './types';
import { AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function App() {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'usr_company_1',
    name: 'Rajesh Sharma',
    email: 'procurement@acme.test',
    companyName: 'Acme Technologies Pvt Ltd',
    role: 'COMPANY_USER',
    department: 'Workplace & Facilities',
    phone: '+91 98450 11223',
    avatarInitials: 'RS',
    createdAt: '2026-01-15T09:00:00Z'
  });
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  const [resetToken, setResetToken] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  // Routing State
  const [currentRoute, setCurrentRoute] = useState<string>('/company/dashboard');
  const [selectedRequestId, setSelectedRequestId] = useState<string>('pr_demo_124');

  // Core Data
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [history, setHistory] = useState<HistoricalPurchase[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [payments, setPayments] = useState<PayPalPaymentRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // UI State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadAllData = async () => {
    try {
      const [reqs, inv, supp, hist, notifs, pmts, audits] = await Promise.all([
        api.getProcurements(),
        api.getInventory(),
        api.getSuppliers(),
        api.getHistory(),
        api.getNotifications(currentUser?.role),
        api.getPayments(),
        api.getAuditLogs()
      ]);
      setRequests(reqs);
      setInventory(inv);
      setSuppliers(supp);
      setHistory(hist);
      setNotifications(notifs);
      setPayments(pmts);
      setAuditLogs(audits);

      if (reqs.length > 0 && !reqs.find(r => r.id === selectedRequestId)) {
        setSelectedRequestId(reqs[0].id);
      }
    } catch (err: any) {
      console.error('Data loading error:', err);
      showToast('Could not sync data with server.', 'error');
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadAllData();
    }
  }, [currentUser]);

  // Auth Handlers
  const handleLogin = async (credentials: { email: string; password: string }) => {
    setIsActionLoading(true);
    setAuthError('');
    try {
      const user = await api.login(credentials);
      setCurrentUser(user);

      // Route by role matching Section 3
      if (user.role === 'FINANCE_APPROVER') {
        setCurrentRoute('/finance/dashboard');
      } else if (user.role === 'SUPPLIER') {
        setCurrentRoute('/supplier/dashboard');
      } else {
        setCurrentRoute('/company/dashboard');
      }

      showToast(`Welcome back, ${user.name}`);
    } catch (err: any) {
      setAuthError(err.message || 'Invalid credentials');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRegister = async (data: any) => {
    setIsActionLoading(true);
    setAuthError('');
    try {
      const newUser = await api.register(data);
      setCurrentUser(newUser);
      setCurrentRoute(newUser.role === 'SUPPLIER' ? '/supplier/dashboard' : '/company/dashboard');
      showToast(`Account registered successfully for ${newUser.companyName}`);
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthView('login');
    showToast('Logged out of session');
  };

  const handleRoleSwitch = (newRole: UserRole) => {
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      role: newRole,
      name:
        newRole === 'FINANCE_APPROVER'
          ? 'Ananya Roy (Head of Treasury)'
          : newRole === 'SUPPLIER'
          ? 'Vikram Mehta (Apex Ergonomics)'
          : 'Rajesh Sharma (Procurement Lead)'
    };
    setCurrentUser(updated);

    if (newRole === 'FINANCE_APPROVER') {
      setCurrentRoute('/finance/dashboard');
    } else if (newRole === 'SUPPLIER') {
      setCurrentRoute('/supplier/dashboard');
    } else {
      setCurrentRoute('/company/dashboard');
    }

    showToast(`Switched active view to ${newRole.replace('_', ' ')}`);
  };

  // Procurement Handlers
  const handleCreateProcurement = async (payload: any) => {
    setIsActionLoading(true);
    try {
      const newPR = await api.createProcurement(payload);
      setRequests(prev => [newPR, ...prev]);
      setSelectedRequestId(newPR.id);
      setCurrentRoute(`/company/procurement/${newPR.id}`);
      showToast(`Created ${newPR.code}. AI understanding initialized.`);
      await loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit procurement', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpdateUnderstanding = async (updates: any) => {
    if (!selectedRequestId) return;
    setIsActionLoading(true);
    try {
      const updated = await api.updateUnderstanding(selectedRequestId, updates);
      setRequests(prev => prev.map(r => (r.id === updated.id ? updated : r)));
      showToast('AI assumptions updated and inventory re-checked.');
    } catch (err: any) {
      showToast(err.message || 'Update failed', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAddQuote = async (quoteData: any) => {
    if (!selectedRequestId) return;
    setIsActionLoading(true);
    try {
      const updated = await api.addQuote(selectedRequestId, quoteData);
      const analyzed = await api.runAIAnalysis(updated.id);
      setRequests(prev => prev.map(r => (r.id === analyzed.id ? analyzed : r)));
      showToast('Quotation attached and AI scoring recalculated.');
      await loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Quotation upload failed', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRunAIAnalysis = async () => {
    if (!selectedRequestId) return;
    setIsActionLoading(true);
    try {
      const analyzed = await api.runAIAnalysis(selectedRequestId);
      setRequests(prev => prev.map(r => (r.id === analyzed.id ? analyzed : r)));
      showToast('AI multi-factor evaluation and risk analysis refreshed.');
      await loadAllData();
    } catch (err: any) {
      showToast(err.message || 'AI analysis failed', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSubmitApproval = async (decision: 'APPROVE' | 'REJECT' | 'CHANGES', note: string) => {
    if (!selectedRequestId) return;
    setIsActionLoading(true);
    try {
      const approverName = currentUser?.name || 'Ananya Roy';
      const updated = await api.submitApproval(selectedRequestId, decision, note, approverName);
      setRequests(prev => prev.map(r => (r.id === updated.id ? updated : r)));
      showToast(
        decision === 'APPROVE'
          ? 'Procurement order APPROVED by Finance. PayPal checkout unlocked.'
          : decision === 'REJECT'
          ? 'Procurement request REJECTED.'
          : 'Request sent back for price negotiation.'
      );
      await loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Approval recording failed', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleExecutePayment = async (orderId: string) => {
    if (!selectedRequestId) return;
    setIsActionLoading(true);
    try {
      const approverName = currentUser?.name || 'Ananya Roy';
      const updated = await api.capturePayPalPayment(selectedRequestId, orderId, approverName);
      setRequests(prev => prev.map(r => (r.id === updated.id ? updated : r)));
      showToast(`Payment successfully settled via PayPal Sandbox. Status: PAID.`);
      await loadAllData();
    } catch (err: any) {
      showToast(err.message || 'PayPal capture failed', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      const resetPR = await api.resetDemo();
      await loadAllData();
      setSelectedRequestId(resetPR.id);
      setCurrentRoute(`/company/procurement/${resetPR.id}`);
      showToast('Demo scenario reset to pristine 100-chair procurement state.');
    } catch (err: any) {
      showToast('Failed to reset demo scenario', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  // If not logged in, render authentication screens
  if (!currentUser) {
    if (authView === 'register') {
      return (
        <RegisterPage
          onRegister={handleRegister}
          onNavigateLogin={() => setAuthView('login')}
          isLoading={isActionLoading}
          errorMessage={authError}
        />
      );
    }

    if (authView === 'forgot') {
      return (
        <ForgotPasswordPage
          onSubmit={api.forgotPassword}
          onNavigateLogin={() => setAuthView('login')}
          onNavigateReset={token => {
            setResetToken(token);
            setAuthView('reset');
          }}
          isLoading={isActionLoading}
        />
      );
    }

    if (authView === 'reset') {
      return (
        <ResetPasswordPage
          token={resetToken}
          onReset={pwd => api.resetPassword({ token: resetToken, newPassword: pwd })}
          onNavigateLogin={() => setAuthView('login')}
          isLoading={isActionLoading}
          errorMessage={authError}
        />
      );
    }

    return (
      <LoginPage
        onLogin={handleLogin}
        onNavigateRegister={() => setAuthView('register')}
        onNavigateForgotPassword={() => setAuthView('forgot')}
        isLoading={isActionLoading}
        errorMessage={authError}
      />
    );
  }

  const selectedRequest = requests.find(r => r.id === selectedRequestId) || requests[0];
  const unreadCount = notifications.filter(n => !n.read).length;

  // Role-based route guard check (Section 44)
  const isUnauthorized =
    (currentUser.role === 'COMPANY_USER' && (currentRoute.startsWith('/finance') || currentRoute.startsWith('/supplier'))) ||
    (currentUser.role === 'SUPPLIER' && (currentRoute.startsWith('/company') || currentRoute.startsWith('/finance'))) ||
    (currentUser.role === 'FINANCE_APPROVER' && currentRoute.startsWith('/supplier'));

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Role-Specific Sidebar (Section 6 & 7 & 15 & 27) */}
      <Sidebar
        currentUser={currentUser}
        currentRoute={currentRoute}
        onNavigate={setCurrentRoute}
        onLogout={handleLogout}
        unreadNotificationsCount={unreadCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav
          currentUser={currentUser}
          onRoleSwitch={handleRoleSwitch}
          onResetDemo={handleResetDemo}
          isResetting={isResetting}
          unreadCount={unreadCount}
          onToggleNotifications={() => setIsNotificationsOpen(true)}
          currentRoute={currentRoute}
        />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {/* Toast Notification */}
          {toastMessage && (
            <div
              className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200 ${
                toastMessage.type === 'success'
                  ? 'bg-slate-900 text-white border-slate-700'
                  : 'bg-rose-900 text-white border-rose-700'
              }`}
            >
              {toastMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{toastMessage.text}</span>
            </div>
          )}

          {/* 403 Forbidden Guard Warning if navigating across roles */}
          {isUnauthorized ? (
            <div className="p-8 bg-white rounded-2xl border border-rose-200 text-center space-y-4 max-w-lg mx-auto my-12">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                403 Forbidden — Role Authorization Guard
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your current active role is <strong className="text-slate-800">{currentUser.role}</strong>. You are not authorized to view the requested portal route (<code className="font-mono">{currentRoute}</code>).
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() =>
                    setCurrentRoute(
                      currentUser.role === 'FINANCE_APPROVER'
                        ? '/finance/dashboard'
                        : currentUser.role === 'SUPPLIER'
                        ? '/supplier/dashboard'
                        : '/company/dashboard'
                    )
                  }
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
                >
                  Return to My Portal
                </button>
                <button
                  onClick={() => {
                    const targetRole = currentRoute.startsWith('/finance')
                      ? 'FINANCE_APPROVER'
                      : currentRoute.startsWith('/supplier')
                      ? 'SUPPLIER'
                      : 'COMPANY_USER';
                    handleRoleSwitch(targetRole as any);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  Switch Role in Top Bar
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* COMPANY PORTAL ROUTES */}
              {currentRoute === '/company/dashboard' && (
                <CompanyDashboard
                  requests={requests}
                  suppliers={suppliers}
                  onSelectRequest={id => {
                    setSelectedRequestId(id);
                    setCurrentRoute(`/company/procurement/${id}`);
                  }}
                  onNavigateNewRequest={() => setCurrentRoute('/company/procurement/new')}
                  onNavigateSuppliers={() => setCurrentRoute('/company/suppliers')}
                  onNavigateInventory={() => setCurrentRoute('/company/inventory')}
                />
              )}

              {currentRoute === '/company/procurement/new' && (
                <CreateProcurementPage
                  inventory={inventory}
                  onSubmit={handleCreateProcurement}
                  onCancel={() => setCurrentRoute('/company/dashboard')}
                  isSubmitting={isActionLoading}
                />
              )}

              {(currentRoute === '/company/procurement' || currentRoute.startsWith('/company/procurement/')) &&
                !currentRoute.endsWith('/compare') &&
                currentRoute !== '/company/procurement/new' &&
                selectedRequest && (
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setCurrentRoute(`/company/procurement/${selectedRequest.id}/compare`)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200"
                      >
                        Open Supplier Comparison Table →
                      </button>
                    </div>
                    <ProcurementDetailView
                      request={selectedRequest}
                      currentRole={currentUser.role}
                      onUpdateUnderstanding={handleUpdateUnderstanding}
                      onAddQuote={handleAddQuote}
                      onRunAIAnalysis={handleRunAIAnalysis}
                      onSubmitApproval={handleSubmitApproval}
                      onExecutePayment={handleExecutePayment}
                      onBackToDashboard={() => setCurrentRoute('/company/dashboard')}
                      isActionLoading={isActionLoading}
                    />
                  </div>
                )}

              {currentRoute.endsWith('/compare') && selectedRequest && (
                <SupplierComparisonPage
                  request={selectedRequest}
                  onBack={() => setCurrentRoute(`/company/procurement/${selectedRequest.id}`)}
                />
              )}

              {currentRoute === '/company/inventory' && (
                <InventoryView items={inventory} onRefresh={loadAllData} />
              )}

              {currentRoute === '/company/suppliers' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <h2 className="text-base font-bold text-slate-900">Enrolled Supplier Directory</h2>
                    <span className="text-xs font-mono text-slate-500">{suppliers.length} Qualified Vendors</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {suppliers.map(s => (
                      <div key={s.id} className="p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="font-bold text-slate-900">{s.name}</span>
                          <span className="font-mono text-[10px] text-slate-400">{s.code}</span>
                        </div>
                        <div className="text-slate-600">{s.address}</div>
                        <div className="pt-2 border-t border-slate-100 flex justify-between font-mono text-[11px]">
                          <span className="text-slate-500">Rating: {s.performance.overallRating}/100</span>
                          <span className="text-emerald-700 font-bold">{s.performance.onTimeDeliveryRate}% on-time</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentRoute === '/company/quotes' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <h2 className="text-base font-bold text-slate-900">Quotations Management Hub</h2>
                  <p className="text-xs text-slate-500">
                    All normalized proposals currently active across open requests.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] text-slate-500 font-semibold font-sans">
                        <tr>
                          <th className="px-4 py-3">Supplier</th>
                          <th className="px-4 py-3">Product</th>
                          <th className="px-4 py-3 text-right">Unit Price</th>
                          <th className="px-4 py-3 text-right">Grand Total</th>
                          <th className="px-4 py-3 text-center">Lead Time</th>
                          <th className="px-4 py-3 text-center">AI Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {requests.flatMap(r => r.quotes || []).map(q => (
                          <tr key={q.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-sans font-bold text-slate-900">{q.supplierName}</td>
                            <td className="px-4 py-3 font-sans text-slate-700">{q.productName}</td>
                            <td className="px-4 py-3 text-right">₹{q.unitPrice.toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3 text-right font-bold">₹{q.grandTotal.toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3 text-center">{q.deliveryDays} Days</td>
                            <td className="px-4 py-3 text-center font-bold text-indigo-700">{q.scores?.compositeScore || '—'}/100</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {currentRoute === '/company/analytics' && (
                <CompanyAnalyticsPage requests={requests} suppliers={suppliers} />
              )}

              {/* FINANCE PORTAL ROUTES */}
              {currentRoute === '/finance/dashboard' && (
                <FinanceDashboard
                  requests={requests}
                  payments={payments}
                  onSelectApproval={id => {
                    setSelectedRequestId(id);
                    setCurrentRoute(`/finance/approvals/${id}`);
                  }}
                  onNavigatePayments={() => setCurrentRoute('/finance/payments')}
                  onNavigateAudit={() => setCurrentRoute('/finance/audit')}
                />
              )}

              {currentRoute.startsWith('/finance/approvals') && selectedRequest && (
                <FinanceApprovalPage
                  request={selectedRequest}
                  onApproveAndPay={handleExecutePayment}
                  onSubmitApprovalDecision={handleSubmitApproval}
                  onBack={() => setCurrentRoute('/finance/dashboard')}
                  isProcessing={isActionLoading}
                />
              )}

              {currentRoute.startsWith('/finance/payments') && (
                <FinancePaymentsPage
                  payments={payments}
                  requests={requests}
                  onOpenProcurement={id => {
                    setSelectedRequestId(id);
                    setCurrentRoute(`/finance/approvals/${id}`);
                  }}
                />
              )}

              {currentRoute === '/finance/reports' && (
                <FinanceReportsPage requests={requests} suppliers={suppliers} />
              )}

              {currentRoute === '/finance/audit' && (
                <FinanceAuditPage logs={auditLogs} />
              )}

              {/* SUPPLIER PORTAL ROUTES */}
              {currentRoute === '/supplier/dashboard' && (
                <SupplierDashboard
                  requests={requests}
                  currentUser={currentUser}
                  onSelectRFQ={id => {
                    setSelectedRequestId(id);
                    setCurrentRoute(`/supplier/procurements/${id}`);
                  }}
                />
              )}

              {currentRoute.startsWith('/supplier/procurements') && selectedRequest && (
                <SupplierQuotationPage
                  request={selectedRequest}
                  currentUser={currentUser}
                  onSubmitQuote={handleAddQuote}
                  onBack={() => setCurrentRoute('/supplier/dashboard')}
                  isSubmitting={isActionLoading}
                />
              )}

              {currentRoute === '/supplier/orders' && selectedRequest && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <h2 className="text-base font-bold text-slate-900">Supplier Purchase Orders</h2>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">PO Number:</span>
                      <span className="font-bold text-slate-900">{selectedRequest.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Buyer:</span>
                      <span className="font-sans font-medium text-slate-800">Acme Technologies Pvt Ltd</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Allocated Units:</span>
                      <span>{selectedRequest.recommendation?.recommendedQuantity || 65} Units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Total Order Value:</span>
                      <span className="font-bold text-emerald-600">
                        ₹{(selectedRequest.recommendation?.recommendedAmount || 178490).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Delivery Deadline:</span>
                      <span>{selectedRequest.deliveryDeadlineDate}</span>
                    </div>
                  </div>
                </div>
              )}

              {currentRoute === '/supplier/payments' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <h2 className="text-base font-bold text-slate-900">PayPal Received Settlements</h2>
                  <p className="text-xs text-slate-500">
                    Disbursements completed via corporate PayPal Sandbox checkout.
                  </p>
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-mono space-y-2 text-emerald-900">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="font-bold">SETTLED IN SANDBOX</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Beneficiary Account:</span>
                      <span>billing@apex-ergo.com</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Settlement Total:</span>
                      <span className="font-bold">₹1,78,490</span>
                    </div>
                  </div>
                </div>
              )}

              {/* COMMON ROUTES */}
              {currentRoute === '/notifications' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <h2 className="text-base font-bold text-slate-900">Notifications & Alerts</h2>
                    <span className="text-xs text-slate-500 font-mono">{unreadCount} Unread</span>
                  </div>
                  <div className="space-y-3">
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        className={`p-4 rounded-xl border text-xs flex justify-between items-center ${
                          n.read ? 'bg-slate-50 text-slate-600' : 'bg-indigo-50/50 border-indigo-200 font-medium'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-slate-900">{n.title}</div>
                          <div className="text-slate-600 mt-0.5">{n.message}</div>
                        </div>
                        {!n.read && (
                          <button
                            onClick={() => handleMarkNotificationRead(n.id)}
                            className="text-[11px] text-indigo-600 font-semibold hover:underline shrink-0"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(currentRoute === '/profile' || currentRoute === '/settings') && (
                <ProfileSettingsPage
                  currentUser={currentUser}
                  onLogout={handleLogout}
                  onSaveProfile={updates => {
                    setCurrentUser(prev => (prev ? { ...prev, ...updates } : prev));
                    showToast('Profile information saved');
                  }}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Notifications Slide-over Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
        onNavigate={setCurrentRoute}
      />
    </div>
  );
}
