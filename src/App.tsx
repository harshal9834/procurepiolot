import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { SupplierRegisterPage } from './components/auth/SupplierRegisterPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { RequesterDashboard } from './components/requester/RequesterDashboard';
import { CreateRequestPage } from './components/requester/CreateRequestPage';
import { RequesterRequestDetail } from './components/requester/RequesterRequestDetail';
import { FinanceDashboard } from './components/finance/FinanceDashboard';
import { FinanceApprovalPage } from './components/finance/FinanceApprovalPage';
import { FinancePaymentsPage } from './components/finance/FinancePaymentsPage';
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<'login' | 'register' | 'supplier-register' | 'forgot' | 'reset'>('login');
  const [resetToken, setResetToken] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  // Routing State
  const [currentRoute, setCurrentRoute] = useState<string>('/requester/dashboard');
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

  // Restore authenticated session on mount
  useEffect(() => {
    const initAuth = async () => {
      const path = window.location.pathname;
      if (path === '/supplier/register') {
        setAuthView('supplier-register');
        return;
      }

      const token = api.getToken();
      if (token) {
        try {
          const user = await api.getMe();
          setCurrentUser(user);
          if (path && path !== '/' && path !== '/login') {
            setCurrentRoute(path);
          } else if (user.role === 'FINANCE_APPROVER') {
            setCurrentRoute('/finance/dashboard');
          } else if (user.role === 'SUPPLIER') {
            setCurrentRoute('/supplier/dashboard');
          } else {
            setCurrentRoute('/requester/dashboard');
          }
        } catch {
          api.clearToken();
          setCurrentUser(null);
        }
      } else {
        // Automatically sign in with default company requester demo user for immediate evaluation
        try {
          const user = await api.login({ email: 'procurement@acme.test', password: 'demo123' });
          setCurrentUser(user);
          setCurrentRoute('/requester/dashboard');
        } catch {
          setCurrentUser(null);
        }
      }
    };
    initAuth();
  }, []);

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

      // Route by role
      if (user.role === 'FINANCE_APPROVER') {
        setCurrentRoute('/finance/dashboard');
      } else if (user.role === 'SUPPLIER') {
        setCurrentRoute('/supplier/dashboard');
      } else {
        setCurrentRoute('/requester/dashboard');
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
      setCurrentRoute(newUser.role === 'SUPPLIER' ? '/supplier/dashboard' : '/requester/dashboard');
      showToast(`Account registered successfully for ${newUser.companyName}`);
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleLogout = () => {
    api.clearToken();
    setCurrentUser(null);
    setAuthView('login');
    showToast('Logged out of session');
  };

  const handleRoleSwitch = async (newRole: UserRole) => {
    setIsActionLoading(true);
    try {
      const demoAccounts: Record<UserRole, string> = {
        COMPANY_USER: 'procurement@acme.test',
        FINANCE_APPROVER: 'finance@acme.test',
        SUPPLIER: 'supplier-a@test.com'
      };
      const email = demoAccounts[newRole];
      const user = await api.login({ email, password: 'demo123' });
      setCurrentUser(user);

      if (newRole === 'FINANCE_APPROVER') {
        setCurrentRoute('/finance/dashboard');
      } else if (newRole === 'SUPPLIER') {
        setCurrentRoute('/supplier/dashboard');
      } else {
        setCurrentRoute('/requester/dashboard');
      }

      showToast(`Authenticated as ${user.name} (${user.role.replace('_', ' ')})`);
      await loadAllData();
    } catch (err: any) {
      showToast('Could not switch session: ' + err.message, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Procurement Handlers
  const handleCreateProcurement = async (payload: any) => {
    setIsActionLoading(true);
    try {
      const newPR = await api.createProcurement(payload);
      setRequests(prev => [newPR, ...prev]);
      setSelectedRequestId(newPR.id);
      setCurrentRoute(`/requester/requests/${newPR.id}`);
      showToast(`Created ${newPR.code}. Request dispatched to suppliers.`);
      await loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit procurement', 'error');
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
      showToast('Quotation submitted successfully.');
      await loadAllData();
      setCurrentRoute('/supplier/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Quotation submission failed', 'error');
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
      showToast('AI multi-supplier comparison and recommendation refreshed.');
      await loadAllData();
    } catch (err: any) {
      showToast(err.message || 'AI analysis failed', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRequesterApprove = async (supplierId: string, note?: string) => {
    if (!selectedRequestId) return;
    setIsActionLoading(true);
    try {
      const updated = await api.requesterApprove(selectedRequestId, { supplierId, note });
      setRequests(prev => prev.map(r => (r.id === updated.id ? updated : r)));
      showToast('Procurement recommendation approved! Dispatched to Finance for PayPal payment.');
      await loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Requester approval failed', 'error');
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
      const result = await api.capturePayPalPayment(selectedRequestId, orderId, approverName);
      const updatedPR = (result as any).data || (result as any);
      setRequests(prev => prev.map(r => (r.id === updatedPR.id ? updatedPR : r)));
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
      setCurrentRoute(`/requester/requests/${resetPR.id}`);
      showToast('Environment successfully reset to pristine 100-chair procurement demo.');
    } catch (err: any) {
      showToast('Demo reset failed: ' + err.message, 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  // Render Auth Views if unauthenticated
  if (!currentUser) {
    if (authView === 'supplier-register' || window.location.pathname === '/supplier/register') {
      return (
        <SupplierRegisterPage
          onSuccess={async (newUser: User) => {
            setCurrentUser(newUser);
            setCurrentRoute('/supplier/dashboard');
            showToast('Supplier registered! Welcome to your dashboard.');
            await loadAllData();
          }}
          onNavigateLogin={() => setAuthView('login')}
        />
      );
    }

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
          onSubmit={async (email: string) => {
            const res = await api.forgotPassword(email);
            return {
              message: 'If an account exists with this email, a reset token has been dispatched.',
              demoResetToken: res.demoResetToken
            };
          }}
          onNavigateLogin={() => setAuthView('login')}
          onNavigateReset={(tok: string) => {
            setResetToken(tok);
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
          onReset={async (newPassword: string) => {
            await api.resetPassword({ token: resetToken, newPassword });
            showToast('Password updated. Please sign in.');
            setAuthView('login');
          }}
          onNavigateLogin={() => setAuthView('login')}
          isLoading={isActionLoading}
        />
      );
    }

    return (
      <LoginPage
        onLogin={handleLogin}
        onNavigateRegister={() => setAuthView('register')}
        onNavigateForgotPassword={() => setAuthView('forgot')}
        onNavigateSupplierRegister={() => setAuthView('supplier-register')}
        isLoading={isActionLoading}
        errorMessage={authError}
      />
    );
  }

  const selectedRequest = requests.find(r => r.id === selectedRequestId) || requests[0];
  const unreadCount = notifications.filter(n => !n.read).length;

  // Role-based route guard check
  const isUnauthorized =
    (currentUser.role === 'COMPANY_USER' && (currentRoute.startsWith('/finance') || currentRoute.startsWith('/supplier'))) ||
    (currentUser.role === 'SUPPLIER' && (currentRoute.startsWith('/requester') || currentRoute.startsWith('/company') || currentRoute.startsWith('/finance'))) ||
    (currentUser.role === 'FINANCE_APPROVER' && (currentRoute.startsWith('/supplier') || currentRoute.startsWith('/requester')));

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Role-Specific Sidebar */}
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
                        : '/requester/dashboard'
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
              {/* 1. REQUESTER ROUTES */}
              {(currentRoute === '/requester/dashboard' || currentRoute === '/company/dashboard' || currentRoute === '/requester/requests') && (
                <RequesterDashboard
                  requests={requests}
                  onCreateNew={() => setCurrentRoute('/requester/request/new')}
                  onSelectRequest={id => {
                    setSelectedRequestId(id);
                    setCurrentRoute(`/requester/requests/${id}`);
                  }}
                />
              )}

              {(currentRoute === '/requester/request/new' || currentRoute === '/company/procurement/new') && (
                <CreateRequestPage
                  suppliers={suppliers}
                  onSubmit={handleCreateProcurement}
                  onCancel={() => setCurrentRoute('/requester/dashboard')}
                  isSubmitting={isActionLoading}
                />
              )}

              {(currentRoute.startsWith('/requester/requests/') || currentRoute.startsWith('/company/procurement/')) && selectedRequest && (
                <RequesterRequestDetail
                  request={selectedRequest}
                  onBack={() => setCurrentRoute('/requester/dashboard')}
                  onRunAIAnalysis={handleRunAIAnalysis}
                  onApprove={handleRequesterApprove}
                  isActionLoading={isActionLoading}
                />
              )}

              {/* 2. SUPPLIER ROUTES */}
              {(currentRoute === '/supplier/dashboard' ||
                currentRoute === '/supplier/requests' ||
                currentRoute === '/supplier/quotes' ||
                currentRoute === '/supplier/orders' ||
                currentRoute === '/supplier/payments') && (
                <SupplierDashboard
                  requests={requests}
                  currentUser={currentUser}
                  onSelectRFQ={id => {
                    setSelectedRequestId(id);
                    setCurrentRoute(`/supplier/quote/${id}`);
                  }}
                />
              )}

              {(currentRoute.startsWith('/supplier/quote/') || currentRoute.startsWith('/supplier/procurements/')) && selectedRequest && (
                <SupplierQuotationPage
                  request={selectedRequest}
                  currentUser={currentUser}
                  onSubmitQuote={handleAddQuote}
                  onBack={() => setCurrentRoute('/supplier/dashboard')}
                  isSubmitting={isActionLoading}
                />
              )}

              {/* 3. FINANCE ROUTES */}
              {(currentRoute === '/finance/dashboard' || currentRoute === '/finance/pending') && (
                <FinanceDashboard
                  requests={requests}
                  payments={payments}
                  onSelectApproval={id => {
                    setSelectedRequestId(id);
                    setCurrentRoute(`/finance/approvals/${id}`);
                  }}
                  onNavigatePayments={() => setCurrentRoute('/finance/payments')}
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

              {/* COMMON ROUTES */}
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
