import React, { useState } from 'react';
import { AuditLogEntry } from '../../types';
import { History, ShieldCheck, Search, Filter } from 'lucide-react';

interface FinanceAuditPageProps {
  logs: AuditLogEntry[];
}

export const FinanceAuditPage: React.FC<FinanceAuditPageProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = logs.filter(
    l =>
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Immutable Procurement Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographic ledger tracking every human action, AI agent inference, and PayPal disbursement.
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search events, actors, or details..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">System Activity Records</h2>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {filtered.length} Immutable Entries
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.map(entry => (
            <div key={entry.id} className="p-4 sm:px-6 hover:bg-slate-50 transition-colors flex items-start gap-4 text-xs">
              <div className="font-mono text-slate-400 shrink-0 mt-0.5 text-[11px] w-24">
                {entry.timestamp.slice(11, 19)}
                <div className="text-[10px] text-slate-300">{entry.timestamp.slice(0, 10)}</div>
              </div>

              <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />

              <div className="space-y-1 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-900">{entry.action}</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-slate-600 font-medium">Actor: {entry.actor}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-mono font-bold">
                    {entry.actorRole}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed font-sans">{entry.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
