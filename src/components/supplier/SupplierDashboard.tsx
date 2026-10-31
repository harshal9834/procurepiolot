import React from 'react';
import { ProcurementRequest, User } from '../../types';
import { Store, FileText, CheckCircle2, Clock, DollarSign, ArrowRight } from 'lucide-react';

interface SupplierDashboardProps {
  requests: ProcurementRequest[];
  currentUser: User;
  onSelectRFQ: (id: string) => void;
}

export const SupplierDashboard: React.FC<SupplierDashboardProps> = ({
  requests,
  currentUser,
  onSelectRFQ
}) => {
  const isPaid = requests.some(r => r.status === 'PAID');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-600 font-bold mb-1">
            <Store className="w-4 h-4" />
            <span>VENDOR COMMERCIAL SUITE</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {currentUser.companyName || 'Apex Ergonomics Pvt Ltd'} Portal
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit competitive quotations, review allocated enterprise purchase orders, and verify PayPal Sandbox settlements.
          </p>
        </div>

        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800">
          Status: Verified Tier-1 Preferred Vendor
        </div>
      </div>

      {/* 6 Metric Cards matching Section 16 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium">Active RFQs</div>
          <div className="mt-1.5 text-xl font-bold text-slate-900 font-mono tabular-nums">
            {requests.length || 1}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Assigned to catalog</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-indigo-600 font-medium">Submitted Quotes</div>
          <div className="mt-1.5 text-xl font-bold text-indigo-600 font-mono tabular-nums">
            3
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Commercial proposals</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-emerald-600 font-medium">Accepted Quotes</div>
          <div className="mt-1.5 text-xl font-bold text-emerald-600 font-mono tabular-nums">
            1
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">AI Recommended #1</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-blue-600 font-medium">Purchase Orders</div>
          <div className="mt-1.5 text-xl font-bold text-blue-600 font-mono tabular-nums">
            1
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Active contract</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-amber-600 font-medium">Pending Payments</div>
          <div className="mt-1.5 text-xl font-bold text-amber-600 font-mono tabular-nums">
            {isPaid ? '0' : '₹1.78L'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">In Treasury approval</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-emerald-600 font-medium">Total Received</div>
          <div className="mt-1.5 text-xl font-bold text-emerald-600 font-mono tabular-nums">
            {isPaid ? '₹1.78L' : '₹0'}
          </div>
          <div className="text-[10px] text-emerald-700 mt-0.5">PayPal Sandbox</div>
        </div>
      </div>

      {/* RFQ & Quotes Table matching Section 16 */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-900">Assigned Procurement Requests</h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">Real-time Tender Pipeline</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="px-6 py-3.5">Request ID</th>
                <th className="px-6 py-3.5">Product</th>
                <th className="px-4 py-3.5 text-right">Quantity</th>
                <th className="px-4 py-3.5 text-center">Deadline</th>
                <th className="px-4 py-3.5 text-center">Quote Status</th>
                <th className="px-4 py-3.5 text-center">Payment Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {requests.map(req => (
                <tr
                  key={req.id}
                  onClick={() => onSelectRFQ(req.id)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 font-bold text-amber-700">
                    {req.code}
                  </td>
                  <td className="px-6 py-4 font-sans font-medium text-slate-900">
                    <div>{req.productService}</div>
                    <div className="text-[11px] text-slate-400 font-normal">{req.department}</div>
                  </td>
                  <td className="px-4 py-4 text-right tabular-nums text-slate-700">
                    {req.recommendation?.recommendedQuantity || req.requestedQuantity} Units
                  </td>
                  <td className="px-4 py-4 text-center tabular-nums text-slate-700">
                    {req.deliveryRequiredDays} Days ({req.deliveryDeadlineDate})
                  </td>
                  <td className="px-4 py-4 text-center font-sans">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      SUBMITTED
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center font-sans">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        req.status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {req.status === 'PAID' ? 'PAID & SETTLED' : 'PENDING APPROVAL'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-sans">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onSelectRFQ(req.id);
                      }}
                      className="text-xs text-amber-700 font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <span>Manage Proposal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
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
