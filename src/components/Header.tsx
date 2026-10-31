import React from 'react';
import { UserRole } from '../types';
import { ShieldCheck, RotateCcw, Building2, Wallet, Store } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onResetDemo: () => void;
  isResetting: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  activeTab,
  onTabChange,
  onResetDemo,
  isResetting
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onTabChange('detail')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs font-bold text-sm tracking-tighter">
                P
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors whitespace-nowrap">
                  ProcurePilot AI
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs text-slate-500 font-mono">
                  v2.4
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: 4-5 concise single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'dashboard' ? 'text-indigo-600 font-semibold' : ''
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => onTabChange('detail')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'detail' ? 'text-indigo-600 font-semibold' : ''
              }`}
            >
              Decision Console
            </button>
            <button
              onClick={() => onTabChange('inventory')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'inventory' ? 'text-indigo-600 font-semibold' : ''
              }`}
            >
              Inventory Depot
            </button>
            <button
              onClick={() => onTabChange('suppliers')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'suppliers' ? 'text-indigo-600 font-semibold' : ''
              }`}
            >
              Supplier Network
            </button>
            <button
              onClick={() => onTabChange('memory')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'memory' ? 'text-indigo-600 font-semibold' : ''
              }`}
            >
              AI Memory
            </button>
          </nav>

          {/* Zone 3: Role Switcher & Sandbox Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Role Switcher */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                title="Switch to Company Procurement Requester"
                onClick={() => onRoleChange('COMPANY_USER')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                  currentRole === 'COMPANY_USER'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Requester</span>
              </button>

              <button
                title="Switch to Finance Treasury Approver"
                onClick={() => onRoleChange('FINANCE_APPROVER')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                  currentRole === 'FINANCE_APPROVER'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Finance</span>
              </button>

              <button
                title="Switch to Supplier Rep (Apex Ergonomics)"
                onClick={() => onRoleChange('SUPPLIER')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                  currentRole === 'SUPPLIER'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Store className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Supplier</span>
              </button>
            </div>

            {/* Reset Demo Scenario */}
            <button
              onClick={onResetDemo}
              disabled={isResetting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shadow-xs disabled:opacity-50"
              title="Reset state to pristine 100-chair procurement scenario"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-indigo-600' : ''}`} />
              <span className="hidden lg:inline">Reset Demo</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
