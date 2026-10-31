import React from 'react';
import { HistoricalPurchase } from '../types';
import { History, TrendingUp, AlertTriangle, CheckCircle2, ShieldCheck, Database } from 'lucide-react';

interface MemoryViewProps {
  history: HistoricalPurchase[];
}

export const MemoryView: React.FC<MemoryViewProps> = ({ history }) => {
  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 font-semibold mb-1">
            <Database className="w-4 h-4" />
            <span>ORGANIZATIONAL PROCUREMENT MEMORY</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Historical Benchmark Index
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            ProcurePilot retains institutional memory of all past contracts, unit costs, vendor delivery adherence, and warranty claims.
          </p>
        </div>

        <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-mono text-indigo-900 font-medium">
          Price Anomaly Detector: Active
        </div>
      </div>

      {/* Memory Intelligence Callout */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-600" />
          <span>Case Study: Longitudinal Office Chair Pricing</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
            <div className="text-slate-500 font-medium">June 2026 (120 Days Ago)</div>
            <div className="text-base font-bold text-slate-900 font-mono">₹2,100 / unit</div>
            <div className="text-[11px] text-slate-500">
              Apex Ergonomics (PO-2026-0612) · 50 units · 0 defects
            </div>
          </div>

          <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1 text-xs">
            <div className="text-indigo-900 font-medium">October 2026 (Today's Quote)</div>
            <div className="text-base font-bold text-indigo-600 font-mono">₹2,200 / unit</div>
            <div className="text-[11px] text-indigo-950 font-medium">
              +₹100 (+4.76%) · Within raw material inflation bounds
            </div>
          </div>

          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-1 text-xs">
            <div className="text-amber-900 font-medium">Alternative Vendor Track Record</div>
            <div className="text-base font-bold text-amber-700 font-mono">ValueCraft (Feb 2026)</div>
            <div className="text-[11px] text-amber-900">
              ₹1,950 / unit · Encountered 4 hydraulic cylinder defects & 2-day delivery slip
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
          When the company purchases office chairs today, ProcurePilot cross-references these historical purchase logs to detect whether a supplier's quote is inflated and whether low-cost bids hide systemic defect risks.
        </p>
      </div>

      {/* Historical Purchases Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-900">
            Historical Ledger & Quality Outcomes
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-3.5">Purchase Date</th>
                <th className="px-6 py-3.5">Item Description</th>
                <th className="px-4 py-3.5">Supplier</th>
                <th className="px-4 py-3.5 text-right">Quantity</th>
                <th className="px-4 py-3.5 text-right">Unit Price</th>
                <th className="px-4 py-3.5 text-right">Total Price</th>
                <th className="px-4 py-3.5 text-center">Delivery SLA</th>
                <th className="px-4 py-3.5 text-center">Quality Rating</th>
                <th className="px-6 py-3.5 text-center">Warranty Claims</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {history.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-500 text-[11px]">
                    {item.purchaseDate}
                  </td>
                  <td className="px-6 py-4 font-sans font-medium text-slate-900">
                    <div>{item.itemName}</div>
                    <div className="text-[11px] text-slate-500 font-normal">{item.itemCode}</div>
                  </td>
                  <td className="px-4 py-4 font-sans text-slate-700">
                    {item.supplierName}
                  </td>
                  <td className="px-4 py-4 text-right tabular-nums text-slate-700">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-4 text-right tabular-nums text-slate-900 font-semibold">
                    ₹{item.unitPrice.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-4 text-right tabular-nums text-slate-900 font-bold">
                    ₹{item.totalPrice.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-4 text-center font-sans">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        item.onTimeDelivery
                          ? 'bg-emerald-50 text-emerald-700 font-medium'
                          : 'bg-rose-50 text-rose-700 font-bold'
                      }`}
                    >
                      {item.onTimeDelivery ? 'On-Time' : 'Delayed'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center tabular-nums text-amber-600 font-bold">
                    {item.qualityRating} / 5
                  </td>
                  <td className="px-6 py-4 text-center tabular-nums">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        item.warrantyIssuesReported === 0
                          ? 'text-slate-600'
                          : 'bg-amber-100 text-amber-800 font-bold'
                      }`}
                    >
                      {item.warrantyIssuesReported} tickets
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
