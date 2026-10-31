import React from 'react';
import {
  User,
  UserRole
} from '../../types';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Building2,
  Package,
  Layers,
  BarChart3,
  Bell,
  CheckCircle2,
  Wallet,
  ShieldAlert,
  FileCheck2,
  History,
  Store,
  DollarSign,
  UserCircle,
  Settings,
  LogOut,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  currentUser: User;
  currentRoute: string;
  onNavigate: (route: string) => void;
  onLogout: () => void;
  unreadNotificationsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  currentRoute,
  onNavigate,
  onLogout,
  unreadNotificationsCount
}) => {
  const role = currentUser.role;

  const renderNavLinks = () => {
    if (role === 'COMPANY_USER') {
      return (
        <>
          <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Company Portal
          </div>
          <button
            onClick={() => onNavigate('/company/dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              currentRoute === '/company/dashboard'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('/company/procurement')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              currentRoute === '/company/procurement' || currentRoute.startsWith('/company/procurement/') && currentRoute !== '/company/procurement/new'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Procurements</span>
          </button>

          <button
            onClick={() => onNavigate('/company/procurement/new')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              currentRoute === '/company/procurement/new'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-4 h-4 shrink-0 text-indigo-600" />
            <span className="text-indigo-600 font-bold">New Request</span>
          </button>

          <button
            onClick={() => onNavigate('/company/inventory')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              currentRoute === '/company/inventory'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Inventory Depots</span>
          </button>

          <button
            onClick={() => onNavigate('/company/suppliers')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              currentRoute.startsWith('/company/suppliers')
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Supplier Network</span>
          </button>

          <button
            onClick={() => onNavigate('/company/quotes')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              currentRoute === '/company/quotes'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Quotations Hub</span>
          </button>

          <button
            onClick={() => onNavigate('/company/analytics')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              currentRoute === '/company/analytics'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Spend Analytics</span>
          </button>
        </>
      );
    } else if (role === 'FINANCE_APPROVER') {
      return (
        <>
          <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Treasury & Approvals
          </div>
          <button
            onClick={() => onNavigate('/finance/dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              currentRoute === '/finance/dashboard'
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Treasury Console</span>
          </button>

          <button
            onClick={() => onNavigate('/finance/approvals')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              currentRoute.startsWith('/finance/approvals')
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Approval Queue</span>
          </button>

          <button
            onClick={() => onNavigate('/finance/payments')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              currentRoute.startsWith('/finance/payments')
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Wallet className="w-4 h-4 shrink-0 text-slate-400" />
            <span>PayPal Settlements</span>
          </button>

          <button
            onClick={() => onNavigate('/finance/reports')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              currentRoute === '/finance/reports'
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Finance Reports</span>
          </button>

          <button
            onClick={() => onNavigate('/finance/audit')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              currentRoute === '/finance/audit'
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Immutable Audit Log</span>
          </button>
        </>
      );
    } else {
      // SUPPLIER
      return (
        <>
          <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Supplier Portal
          </div>
          <button
            onClick={() => onNavigate('/supplier/dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              currentRoute === '/supplier/dashboard'
                ? 'bg-amber-50 text-amber-800'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Vendor Overview</span>
          </button>

          <button
            onClick={() => onNavigate('/supplier/procurements')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              currentRoute.startsWith('/supplier/procurements')
                ? 'bg-amber-50 text-amber-800'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Assigned RFQs</span>
          </button>

          <button
            onClick={() => onNavigate('/supplier/orders')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              currentRoute === '/supplier/orders'
                ? 'bg-amber-50 text-amber-800'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Store className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Purchase Orders</span>
          </button>

          <button
            onClick={() => onNavigate('/supplier/payments')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              currentRoute === '/supplier/payments'
                ? 'bg-amber-50 text-amber-800'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Settled Payments</span>
          </button>
        </>
      );
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      {/* Brand & Wordmark */}
      <div>
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
            P
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 tracking-tight">
              ProcurePilot AI
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Enterprise v2.4
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="p-4 space-y-1 overflow-y-auto">
          {renderNavLinks()}

          {/* Common Links */}
          <div className="pt-4 mt-4 border-t border-slate-100">
            <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              System & Account
            </div>

            <button
              onClick={() => onNavigate('/notifications')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                currentRoute === '/notifications'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-slate-400" />
                <span>Notifications</span>
              </div>
              {unreadNotificationsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-mono font-bold">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onNavigate('/profile')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                currentRoute === '/profile'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <UserCircle className="w-4 h-4 text-slate-400" />
              <span>User Profile</span>
            </button>

            <button
              onClick={() => onNavigate('/settings')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                currentRoute === '/settings'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* User Card & Logout */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
              {currentUser.avatarInitials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-500 font-mono truncate">
                {currentUser.role.replace('_', ' ')}
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Log out of session"
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
