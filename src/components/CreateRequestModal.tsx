import React, { useState } from 'react';
import { X, Sparkles, Send, Check } from 'lucide-react';
import { ProcurementRequest } from '../types';

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
}

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting
}) => {
  const [naturalText, setNaturalText] = useState(
    'We need 100 office chairs for our new office expansion in Bengaluru. Our budget is ₹2,50,000 and we need them delivered on-site within 10 days.'
  );
  const [productService, setProductService] = useState('Office Chairs');
  const [requestedQuantity, setRequestedQuantity] = useState(100);
  const [maxBudget, setMaxBudget] = useState(250000);
  const [deliveryRequiredDays, setDeliveryRequiredDays] = useState(10);
  const [department, setDepartment] = useState('Workplace & Facilities');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('high');
  const [businessJustification, setBusinessJustification] = useState(
    'Required for 95 incoming engineering hires starting next week at Bengaluru Tech Park Phase 2.'
  );
  const [policyConstraints, setPolicyConstraints] = useState(
    'ISO-9001 certified manufacturer. Minimum 2-year commercial warranty.'
  );

  if (!isOpen) return null;

  const handleApplyPreset = (presetText: string, product: string, qty: number, budget: number, days: number, dept: string) => {
    setNaturalText(presetText);
    setProductService(product);
    setRequestedQuantity(qty);
    setMaxBudget(budget);
    setDeliveryRequiredDays(days);
    setDepartment(dept);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      title: `Procurement of ${productService}`,
      description: naturalText,
      productService,
      requestedQuantity,
      maxBudget,
      deliveryRequiredDays,
      department,
      priority,
      businessJustification,
      policyConstraints
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                New AI Procurement Request
              </h2>
              <p className="text-xs text-slate-500">
                Enter your business requirement in natural language or structured fields.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Quick Preset Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Quick Prompt Presets
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  handleApplyPreset(
                    'We need 100 office chairs for our new office expansion in Bengaluru. Our budget is ₹2,50,000 and we need them delivered on-site within 10 days.',
                    'Office Chairs',
                    100,
                    250000,
                    10,
                    'Workplace & Facilities'
                  )
                }
                className="text-xs px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 text-indigo-700 hover:bg-indigo-100 transition-colors font-medium text-left"
              >
                100 Office Chairs (₹2.5L / 10d)
              </button>

              <button
                type="button"
                onClick={() =>
                  handleApplyPreset(
                    'We need 50 enterprise developer laptops with Core i7 and 32GB RAM for new cohort. Maximum budget ₹40,00,000, needed in 14 days.',
                    'Enterprise Developer Laptops',
                    50,
                    4000000,
                    14,
                    'IT & Engineering'
                  )
                }
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors font-medium text-left"
              >
                50 Laptops (₹40L / 14d)
              </button>

              <button
                type="button"
                onClick={() =>
                  handleApplyPreset(
                    'Need 30 4K UHD designer monitors for design team. Budget ₹7,50,000, required within 7 days.',
                    '4K UHD IPS Monitors',
                    30,
                    750000,
                    7,
                    'Product Design'
                  )
                }
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors font-medium text-left"
              >
                30 4K Monitors (₹7.5L / 7d)
              </button>
            </div>
          </div>

          {/* Natural Language Prompt Box */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1.5">
              Natural Language Purchasing Brief
            </label>
            <textarea
              rows={3}
              required
              value={naturalText}
              onChange={e => setNaturalText(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
              placeholder="e.g. We need 100 office chairs for our new office. Our budget is ₹2,50,000 and we need them within 10 days."
            />
            <p className="mt-1 text-xs text-slate-500">
              ProcurePilot’s AI Understanding Agent will parse this prompt into structured specs and verify existing warehouse inventory.
            </p>
          </div>

          {/* Structured Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product / Item Name
              </label>
              <input
                type="text"
                required
                value={productService}
                onChange={e => setProductService(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Requested Quantity
              </label>
              <input
                type="number"
                min={1}
                required
                value={requestedQuantity}
                onChange={e => setRequestedQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Max Budget (INR)
              </label>
              <input
                type="number"
                min={1000}
                required
                value={maxBudget}
                onChange={e => setMaxBudget(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Delivery Deadline (Days)
              </label>
              <input
                type="number"
                min={1}
                max={90}
                required
                value={deliveryRequiredDays}
                onChange={e => setDeliveryRequiredDays(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department
              </label>
              <input
                type="text"
                required
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Urgency Priority
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Business Justification */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Business Justification
            </label>
            <input
              type="text"
              value={businessJustification}
              onChange={e => setBusinessJustification(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Analyzing Requirements...' : 'Submit & Run AI Pipeline'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
