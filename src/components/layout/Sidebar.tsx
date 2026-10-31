import React from 'react';
import { User } from '../../types';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Clock,
  CheckCircle2,
  DollarSign,
  UserCircle,
  LogOut,
  ShoppingBag,
  CreditCard,
  Building2,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  currentUser: User;
  currentRoute: string;
  onNavigate: (route: string) => void;
  onLogout: () => void;
  unreadNotificationsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  currentRoute,
  onNavigate,
  onLogout
}) => {
  const role = currentUser.role;

  const renderNavLinks = () => {
    if (role === 'COMPANY_USER') {
      // REQUESTER ROLE
      return (
        <>
          <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Requester Portal
          </div>
          <button
            onClick={() => onNavigate('/requester/dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              currentRoute === '/requester/dashboard' || currentRoute === '/company/dashboard'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('/requester/requests')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              currentRoute === '/requester/requests' || (currentRoute.startsWith('/requester/requests/') && currentRoute !== '/requester/request/new')
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0 text-slate-400" />
            <span>My Requests</span>
          </button>

          <button
            onClick={() => onNavigate('/requester/request/new')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              currentRoute === '/requester/request/new'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-4 h-4 shrink-0 text-indigo-600" />
            <span className="text-indigo-600 font-bold">Create Request</span>
          </button>
        </>
      );
    } else if (role === 'FINANCE_APPROVER') {
      // FINANCE ROLE
      return (
        <>
          <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Finance Portal
          </div>
          <button
            onClick={() => onNavigate('/finance/dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              currentRoute === '/finance/dashboard'
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('/finance/pending')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              currentRoute === '/finance/pending' || currentRoute.startsWith('/finance/approvals')
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0 text-amber-500" />
            <span>Pending Payments</span>
          </button>

          <button
            onClick={() => onNavigate('/finance/payments')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              currentRoute === '/finance/payments'
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Payment History</span>
          </button>
        </>
      );
    } else {
      // SUPPLIER ROLE
      return (
        <>
          <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Supplier Portal
          </div>
          <button
            onClick={() => onNavigate('/supplier/dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              currentRoute === '/supplier/dashboard'
                ? 'bg-amber-50 text-amber-800'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('/supplier/requests')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              currentRoute === '/supplier/requests' || currentRoute.startsWith('/supplier/quote/') || currentRoute.startsWith('/supplier/procurements/')
                ? 'bg-amber-50 text-amber-800'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Requests</span>
          </button>

          <button
            onClick={() => onNavigate('/supplier/quotes')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              currentRoute === '/supplier/quotes'
                ? 'bg-amber-50 text-amber-800'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-slate-400" />
            <span>My Quotes</span>
          </button>

          <button
            onClick={() => onNavigate('/supplier/orders')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              currentRoute === '/supplier/orders'
                ? 'bg-amber-50 text-amber-800'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Orders</span>
          </button>

          <button
            onClick={() => onNavigate('/supplier/payments')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              currentRoute === '/supplier/payments'
                ? 'bg-amber-50 text-amber-800'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Payments</span>
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
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-sm">
            P
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>ProcurePilot</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-indigo-100 text-indigo-700 rounded-sm font-mono font-bold">
                AI
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Procure-to-Pay Platform
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="p-4 space-y-1 overflow-y-auto">
          {renderNavLinks()}

          {/* User Profile Link */}
          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigate('/profile')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                currentRoute === '/profile'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <UserCircle className="w-4 h-4 text-slate-400" />
              <span>Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* User Card & Logout */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
              {currentUser.avatarInitials || currentUser.name.slice(0, 2).toUpperCase()}
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
