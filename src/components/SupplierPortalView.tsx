import React from 'react';
import { Supplier, ProcurementRequest } from '../types';
import { Store, CheckCircle, Clock, ShieldCheck, FileText, Lock } from 'lucide-react';

interface SupplierPortalViewProps {
  suppliers: Supplier[];
  activeRequest?: ProcurementRequest;
}

export const SupplierPortalView: React.FC<SupplierPortalViewProps> = ({
  suppliers,
  activeRequest
}) => {
  const currentSupplier = suppliers.find(s => s.code === 'SUPP-001') || suppliers[0];
  const isPaid = activeRequest?.status === 'PAID';
  const isAssigned = activeRequest?.recommendation?.recommendedSupplierId === currentSupplier?.id;

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 font-semibold mb-1">
            <Store className="w-4 h-4" />
            <span>VENDOR COLLABORATION SUITE</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {currentSupplier?.name || 'Apex Ergonomics Pvt Ltd'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Vendor Portal for quotation dispatch, purchase order tracking, and PayPal Sandbox settlement monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <span className="text-slate-500">Vendor Code:</span>
          <span className="font-mono font-bold text-slate-900">{currentSupplier?.code}</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="text-emerald-600 font-semibold">Tier-1 Preferred</span>
        </div>
      </div>

      {/* Supplier Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">On-Time Delivery</div>
          <div className="mt-1 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {currentSupplier?.performance.onTimeDeliveryRate}%
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Top decile vendor</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Quality Defect Rate</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600 font-mono tabular-nums">
            {currentSupplier?.performance.defectRate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">BIFMA Class 4 certified</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Average Lead Time</div>
          <div className="mt-1 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {currentSupplier?.performance.averageLeadTimeDays} Days
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Guaranteed on-site SLA</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Orders Completed</div>
          <div className="mt-1 text-2xl font-bold text-indigo-600 font-mono tabular-nums">
            {currentSupplier?.performance.totalOrdersCompleted} POs
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">100% dispute clearance</div>
        </div>
      </div>

      {/* Assigned Purchase Order Card */}
      {activeRequest && isAssigned && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <span>CONTRACT PURCHASE ORDER</span>
                <span aria-hidden="true">·</span>
                <span className="font-bold text-slate-900">{activeRequest.code}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                {activeRequest.title}
              </h2>
            </div>

            <div className="text-right">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-md font-mono ${
                  isPaid
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                    : 'bg-blue-50 text-blue-700 border border-blue-300'
                }`}
              >
                {activeRequest.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="text-slate-500 font-sans">Allocated Quantity</div>
              <div className="text-lg font-bold text-slate-900 tabular-nums">
                {activeRequest.recommendation?.recommendedQuantity || 65} Units
              </div>
              <div className="text-[11px] text-slate-500 font-sans">
                (Client fulfilled 35 units from warehouse)
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="text-slate-500 font-sans">Agreed Unit Rate</div>
              <div className="text-lg font-bold text-slate-900 tabular-nums">
                ₹2,200 / Unit
              </div>
              <div className="text-[11px] text-slate-500 font-sans">
                Inclusive of 36m warranty & assembly
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="text-slate-500 font-sans">Delivery Timeline</div>
              <div className="text-lg font-bold text-emerald-600 tabular-nums">
                8 Business Days
              </div>
              <div className="text-[11px] text-slate-500 font-sans">
                Due: {activeRequest.deliveryDeadlineDate}
              </div>
            </div>
          </div>

          {/* Payment Status Card */}
          <div className="p-5 bg-slate-900 text-white rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  PayPal Sandbox Payment Status
                </span>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                {isPaid ? 'FUNDS CAPTURED' : 'PENDING DISBURSEMENT'}
              </span>
            </div>

            {isPaid ? (
              <div className="text-xs font-mono space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Capture Transaction:</span>
                  <span className="text-white font-bold">{activeRequest.payment?.captureId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Settled Amount:</span>
                  <span className="text-emerald-400 font-bold">
                    ₹{activeRequest.payment?.amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Destination Account:</span>
                  <span className="text-white">{activeRequest.payment?.supplierPayPalAccount}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-300">
                Purchase Order has been recommended by AI and is awaiting final finance authorization. Payment will be automatically settled into your corporate PayPal Sandbox account once approved.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Supplier Directory List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Enrolled Supplier Network
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suppliers.map(s => (
            <div key={s.id} className="p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-slate-900">{s.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{s.code}</div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    s.performance.riskLevel === 'LOW'
                      ? 'bg-emerald-50 text-emerald-700'
                      : s.performance.riskLevel === 'MEDIUM'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {s.performance.riskLevel} RISK
                </span>
              </div>
              <div className="text-slate-600">{s.paymentTerms}</div>
              <div className="pt-2 border-t border-slate-100 flex justify-between font-mono text-[11px]">
                <span className="text-slate-400">Rating: {s.performance.overallRating}/100</span>
                <span className="text-slate-700">{s.performance.averageLeadTimeDays}d lead time</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
