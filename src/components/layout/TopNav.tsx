import React from 'react';
import { User, UserRole, AppNotification } from '../../types';
import {
  Bell,
  RotateCcw,
  Building2,
  Wallet,
  Store,
  ChevronDown
} from 'lucide-react';

interface TopNavProps {
  currentUser: User;
  onRoleSwitch: (role: UserRole) => void;
  onResetDemo: () => void;
  isResetting: boolean;
  unreadCount: number;
  onToggleNotifications: () => void;
  currentRoute: string;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentUser,
  onRoleSwitch,
  onResetDemo,
  isResetting,
  unreadCount,
  onToggleNotifications,
  currentRoute
}) => {
  const getBreadcrumbTitle = () => {
    if (currentRoute === '/company/dashboard') return 'Company Procurement Overview';
    if (currentRoute === '/company/procurement/new') return 'New Procurement Request';
    if (currentRoute.startsWith('/company/procurement/')) return 'Procurement Decision Console';
    if (currentRoute === '/company/procurement') return 'Procurement Orders';
    if (currentRoute === '/company/inventory') return 'Warehouse Inventory Depots';
    if (currentRoute === '/company/suppliers') return 'Vendor Directory & Performance';
    if (currentRoute === '/company/quotes') return 'Supplier Quotations Hub';
    if (currentRoute === '/company/analytics') return 'Corporate Spend Analytics';

    if (currentRoute === '/finance/dashboard') return 'Treasury & Approvals Console';
    if (currentRoute.startsWith('/finance/approvals')) return 'Finance Approval Gate';
    if (currentRoute.startsWith('/finance/payments')) return 'PayPal Sandbox Settlements';
    if (currentRoute === '/finance/reports') return 'Treasury Spend Reports';
    if (currentRoute === '/finance/audit') return 'Cryptographic Audit Trail';

    if (currentRoute === '/supplier/dashboard') return 'Vendor Collaboration Dashboard';
    if (currentRoute.startsWith('/supplier/procurements')) return 'Assigned RFQs & Quotations';
    if (currentRoute === '/supplier/orders') return 'Purchase Orders';
    if (currentRoute === '/supplier/payments') return 'Settled Transactions';

    if (currentRoute === '/notifications') return 'Notification Alerts';
    if (currentRoute === '/profile') return 'User Profile';
    if (currentRoute === '/settings') return 'System & Account Settings';

    return 'ProcurePilot AI';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-400 font-mono">
          {currentUser.companyName}
        </span>
        <span className="text-slate-300">/</span>
        <h1 className="text-sm font-bold text-slate-900 tracking-tight">
          {getBreadcrumbTitle()}
        </h1>
      </div>

      {/* Right: Role Switcher, Reset Demo, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Role Switcher for seamless testing */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
          <button
            onClick={() => onRoleSwitch('COMPANY_USER')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              currentUser.role === 'COMPANY_USER'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Requester</span>
          </button>

          <button
            onClick={() => onRoleSwitch('FINANCE_APPROVER')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              currentUser.role === 'FINANCE_APPROVER'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Finance</span>
          </button>

          <button
            onClick={() => onRoleSwitch('SUPPLIER')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              currentUser.role === 'SUPPLIER'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Supplier</span>
          </button>
        </div>

        {/* Reset Demo Button */}
        <button
          onClick={onResetDemo}
          disabled={isResetting}
          title="Reset to pristine 100-chair procurement demo"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-indigo-600' : ''}`} />
          <span className="hidden lg:inline">Reset Demo</span>
        </button>

        {/* Notifications Bell */}
        <button
          onClick={onToggleNotifications}
          className="relative p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          )}
        </button>

        {/* Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
            {currentUser.avatarInitials}
          </div>
          <span className="hidden md:inline text-xs font-semibold text-slate-800">
            {currentUser.name}
          </span>
        </div>
      </div>
    </header>
  );
};
