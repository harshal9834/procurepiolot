import React from 'react';
import { ProcurementRequest } from '../../types';
import { ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';

interface SupplierComparisonPageProps {
  request: ProcurementRequest;
  onBack: () => void;
}

export const SupplierComparisonPage: React.FC<SupplierComparisonPageProps> = ({
  request,
  onBack
}) => {
  const quotes = request.quotes || [];
  const recSupplierId = request.recommendation?.recommendedSupplierId;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <span>{request.code}</span>
            <span aria-hidden="true">·</span>
            <span>MULTI-FACTOR EVALUATION MATRIX</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Supplier Proposal Comparison Matrix
          </h1>
        </div>

        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Console</span>
        </button>
      </div>

      {/* Comparison Table matching Section 20 */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="px-6 py-4">Evaluation Factor</th>
                <th className="px-4 py-4 text-center font-mono">Weight</th>
                {quotes.map(q => {
                  const isRec = q.supplierId === recSupplierId;
                  return (
                    <th
                      key={q.id}
                      className={`px-6 py-4 text-right font-sans ${
                        isRec ? 'bg-indigo-50/70 text-indigo-950 font-bold' : 'text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>{q.supplierName}</span>
                        {isRec && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-indigo-600 text-white rounded font-mono font-bold">
                            RECOMMENDED
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {/* Row 1: Quoted Total Cost */}
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-3.5 font-sans font-semibold text-slate-900">
                  Total Quoted Invoice
                </td>
                <td className="px-4 py-3.5 text-center text-slate-400">
                  —
                </td>
                {quotes.map(q => (
                  <td key={q.id} className="px-6 py-3.5 text-right font-bold text-slate-900">
                    ₹{q.grandTotal.toLocaleString('en-IN')}
                  </td>
                ))}
              </tr>

              {/* Row 2: True Effective Cost (TCO) */}
              <tr className="hover:bg-slate-50 bg-slate-50/30">
                <td className="px-6 py-3.5 font-sans font-semibold text-slate-900">
                  True Effective Cost (TCO)
                </td>
                <td className="px-4 py-3.5 text-center text-slate-500">
                  30%
                </td>
                {quotes.map(q => (
                  <td key={q.id} className="px-6 py-3.5 text-right font-bold text-indigo-700">
                    ₹{(q.tcoBreakdown?.effectiveTotalCost || q.grandTotal).toLocaleString('en-IN')}
                  </td>
                ))}
              </tr>

              {/* Row 3: Quality Score */}
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-3.5 font-sans font-semibold text-slate-900">
                  Quality & Component Rating
                </td>
                <td className="px-4 py-3.5 text-center text-slate-500">
                  20%
                </td>
                {quotes.map(q => (
                  <td key={q.id} className="px-6 py-3.5 text-right tabular-nums text-slate-800">
                    {q.scores?.qualityScore || 85} / 100
                  </td>
                ))}
              </tr>

              {/* Row 4: Delivery Lead Time */}
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-3.5 font-sans font-semibold text-slate-900">
                  Delivery Speed & SLA Adherence
                </td>
                <td className="px-4 py-3.5 text-center text-slate-500">
                  15%
                </td>
                {quotes.map(q => (
                  <td key={q.id} className="px-6 py-3.5 text-right tabular-nums">
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        q.deliveryDays <= request.deliveryRequiredDays
                          ? 'text-emerald-700 bg-emerald-50'
                          : 'text-rose-700 bg-rose-50'
                      }`}
                    >
                      {q.deliveryDays} Days ({q.scores?.deliveryScore || 80}/100)
                    </span>
                  </td>
                ))}
              </tr>

              {/* Row 5: Warranty Coverage */}
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-3.5 font-sans font-semibold text-slate-900">
                  Manufacturer Warranty
                </td>
                <td className="px-4 py-3.5 text-center text-slate-500">
                  10%
                </td>
                {quotes.map(q => (
                  <td key={q.id} className="px-6 py-3.5 text-right tabular-nums text-slate-800">
                    {q.warrantyMonths} Months ({q.scores?.warrantyScore || 85}/100)
                  </td>
                ))}
              </tr>

              {/* Row 6: Supplier Reliability */}
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-3.5 font-sans font-semibold text-slate-900">
                  Historical Reliability & Quality Track
                </td>
                <td className="px-4 py-3.5 text-center text-slate-500">
                  15%
                </td>
                {quotes.map(q => (
                  <td key={q.id} className="px-6 py-3.5 text-right tabular-nums text-slate-800">
                    {q.scores?.reliabilityScore || 80} / 100
                  </td>
                ))}
              </tr>

              {/* Row 7: Contractual Risk Profile */}
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-3.5 font-sans font-semibold text-slate-900">
                  Risk Level
                </td>
                <td className="px-4 py-3.5 text-center text-slate-500">
                  10%
                </td>
                {quotes.map(q => {
                  const riskLevel = q.scores && q.scores.riskScore >= 80 ? 'LOW' : q.scores && q.scores.riskScore >= 60 ? 'MEDIUM' : 'HIGH';
                  return (
                    <td key={q.id} className="px-6 py-3.5 text-right font-sans font-bold">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] ${
                          riskLevel === 'LOW'
                            ? 'text-emerald-700 bg-emerald-50'
                            : riskLevel === 'MEDIUM'
                            ? 'text-amber-700 bg-amber-50'
                            : 'text-rose-700 bg-rose-50'
                        }`}
                      >
                        {riskLevel} RISK
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Row 8: Composite Final Score */}
              <tr className="bg-slate-50/80 font-bold border-t-2 border-slate-200">
                <td className="px-6 py-4 font-sans text-slate-900 text-sm">
                  Composite Weighted Score
                </td>
                <td className="px-4 py-4 text-center text-slate-700 font-mono">
                  100%
                </td>
                {quotes.map(q => {
                  const isRec = q.supplierId === recSupplierId;
                  return (
                    <td
                      key={q.id}
                      className={`px-6 py-4 text-right font-mono text-base ${
                        isRec ? 'text-indigo-600 font-bold' : 'text-slate-700'
                      }`}
                    >
                      {q.scores?.compositeScore || '—'} / 100
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Recommendation Explanation Card */}
      <div className="p-5 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-2 text-xs">
        <div className="font-bold text-indigo-950 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>AI Decision Justification: Why Apex Ergonomics?</span>
        </div>
        <p className="text-indigo-900/90 leading-relaxed">
          Supplier B (ValueCraft) is ₹5,755 cheaper on the nominal invoice, but fails the mandatory 10-day onboarding deadline (quoting 14 days), lacks on-site floor assembly, and carries a 4.8% historical defect rate that inflates True Cost of Ownership to ₹2,08,735. Apex Ergonomics provides guaranteed 8-day delivery, 36-month commercial warranty, and on-site assembly, achieving the highest value score of 92.2/100.
        </p>
      </div>
    </div>
  );
};
