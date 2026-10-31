import React, { useState } from 'react';
import { InventoryItem } from '../../types';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Package,
  Layers,
  DollarSign,
  FileText,
  AlertTriangle
} from 'lucide-react';

interface CreateProcurementPageProps {
  inventory: InventoryItem[];
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const CreateProcurementPage: React.FC<CreateProcurementPageProps> = ({
  inventory,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Details
  const [title, setTitle] = useState('Procurement of 100 Ergonomic Office Chairs');
  const [productService, setProductService] = useState('Ergonomic Office Chairs');
  const [description, setDescription] = useState(
    'We need 100 ergonomic office chairs for our new office expansion in Bengaluru. Budget is ₹2,50,000 and we need them within 10 days.'
  );
  const [category, setCategory] = useState('Office Furniture');
  const [requestedQuantity, setRequestedQuantity] = useState(100);
  const [unit, setUnit] = useState('Units');
  const [deliveryRequiredDays, setDeliveryRequiredDays] = useState(10);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('high');

  // Step 2: Budget
  const [maxBudget, setMaxBudget] = useState(250000);
  const [currency, setCurrency] = useState('INR');
  const [department, setDepartment] = useState('Facilities & Operations');
  const [costCenter, setCostCenter] = useState('CC-BLR-EXP-402');

  // Step 3: Justification
  const [businessJustification, setBusinessJustification] = useState(
    'Bengaluru Tech Park Phase 2 expansion team onboarding 95 new engineers.'
  );
  const [expectedBenefit, setExpectedBenefit] = useState(
    'Provides ergonomic support preventing strain injuries and meets BIFMA commercial standards.'
  );
  const [policyConstraints, setPolicyConstraints] = useState(
    'ISO-9001 certified manufacturer. Minimum 2-year commercial warranty.'
  );

  // Cross-reference inventory
  const matchedInventory = inventory.find(
    inv =>
      inv.name.toLowerCase().includes('chair') ||
      inv.category.toLowerCase().includes('furniture')
  ) || inventory[0];

  const handleNext = () => setStep(prev => Math.min(5, prev + 1) as any);
  const handlePrev = () => setStep(prev => Math.max(1, prev - 1) as any);

  const handleSubmitFinal = () => {
    onSubmit({
      title,
      productService,
      description,
      category,
      requestedQuantity,
      unit,
      maxBudget,
      currency,
      department,
      costCenter,
      deliveryRequiredDays,
      businessJustification,
      expectedBenefit,
      priority,
      policyConstraints
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Wizard Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Create Procurement Request
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Step-by-step guided workflow linking requirement capture, inventory audit, and AI vendor routing.
        </p>

        {/* 5 Step Indicator */}
        <div className="grid grid-cols-5 gap-2 mt-6">
          {[
            { num: 1, label: 'Details' },
            { num: 2, label: 'Budget' },
            { num: 3, label: 'Justification' },
            { num: 4, label: 'Inventory' },
            { num: 5, label: 'Review' }
          ].map(s => {
            const isCompleted = step > s.num;
            const isCurrent = step === s.num;

            return (
              <div key={s.num} className="space-y-1 text-center">
                <div
                  className={`h-1.5 rounded-full ${
                    isCurrent || isCompleted ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                />
                <span
                  className={`text-[11px] font-semibold ${
                    isCurrent ? 'text-indigo-600 font-bold' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {s.num}. {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: REQUEST DETAILS */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Step 1 — Purchasing Requirement
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Request Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product / Item Name</label>
                <input
                  type="text"
                  required
                  value={productService}
                  onChange={e => setProductService(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                >
                  <option value="Office Furniture">Office Furniture</option>
                  <option value="IT Hardware">IT Hardware</option>
                  <option value="Software & SaaS">Software & SaaS</option>
                  <option value="Facility Supplies">Facility Supplies</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={requestedQuantity}
                  onChange={e => setRequestedQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Unit</label>
                <input
                  type="text"
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Delivery Lead Time (Days)</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={deliveryRequiredDays}
                  onChange={e => setDeliveryRequiredDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Priority Level</label>
              <div className="grid grid-cols-4 gap-2">
                {(['low', 'medium', 'high', 'critical'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 text-center rounded-lg border text-xs font-bold uppercase transition-all ${
                      priority === p
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: BUDGET */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Step 2 — Financial Allocations & Budget
          </h2>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Maximum Approved Budget</label>
                <input
                  type="number"
                  required
                  value={maxBudget}
                  onChange={e => setMaxBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Currency</label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cost Center</label>
                <input
                  type="text"
                  value={costCenter}
                  onChange={e => setCostCenter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: BUSINESS JUSTIFICATION */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Step 3 — Business Justification & Compliance
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Why is this purchase required?</label>
              <textarea
                rows={2}
                value={businessJustification}
                onChange={e => setBusinessJustification(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expected Business Benefit</label>
              <input
                type="text"
                value={expectedBenefit}
                onChange={e => setExpectedBenefit(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Corporate Procurement Policy Constraints</label>
              <input
                type="text"
                value={policyConstraints}
                onChange={e => setPolicyConstraints(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: INVENTORY INTELLIGENCE */}
      {step === 4 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600" />
              <span>Step 4 — Existing Warehouse Inventory Audit</span>
            </h2>
            <span className="text-xs font-mono font-bold text-emerald-600">
              {matchedInventory.availableQuantity} In Local Depot
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="text-slate-500 font-sans font-semibold">Matched Stock Record</div>
              <div className="text-sm font-bold text-slate-900 font-sans">{matchedInventory.name}</div>
              <div className="text-slate-600">Location: {matchedInventory.warehouseLocation}</div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span>Current Quantity:</span>
                <span className="font-bold">{matchedInventory.currentQuantity} units</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Available to Allocate:</span>
                <span>{matchedInventory.availableQuantity} units</span>
              </div>
            </div>

            <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2">
              <div className="text-indigo-950 font-sans font-semibold">AI Recommendation Preview</div>
              <p className="text-indigo-900 leading-relaxed font-sans">
                ProcurePilot detects that 35 units already exist in the Bengaluru Central Facility. AI will recommend purchasing only <span className="font-bold">{requestedQuantity - matchedInventory.availableQuantity} units</span>, saving <span className="font-bold">₹77,000</span> in cash outlay!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: REVIEW */}
      {step === 5 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Step 5 — Final Review & AI Dispatch
          </h2>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Title:</span>
              <span className="font-bold text-slate-900">{title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Gross Quantity:</span>
              <span className="font-mono">{requestedQuantity} {unit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Budget Cap:</span>
              <span className="font-mono font-bold">₹{maxBudget.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Delivery Deadline:</span>
              <span className="font-mono text-emerald-600 font-bold">{deliveryRequiredDays} Days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cost Center / Dept:</span>
              <span>{costCenter} · {department}</span>
            </div>
          </div>
        </div>
      )}

      {/* Wizard Footer Controls */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={step === 1 ? onCancel : handlePrev}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{step === 1 ? 'Cancel' : 'Previous Step'}</span>
        </button>

        {step < 5 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
          >
            <span>Next Step</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmitFinal}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-md disabled:opacity-50 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSubmitting ? 'Analyzing & Routing...' : 'Submit Procurement Request'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
