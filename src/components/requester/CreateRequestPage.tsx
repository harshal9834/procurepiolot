import React, { useState } from 'react';
import { Sparkles, Send, ArrowLeft, CheckCircle2, Building2, Layers, DollarSign, Calendar, Info, Users, Tag } from 'lucide-react';
import { Supplier } from '../../types';
import { api } from '../../api';

interface CreateRequestPageProps {
  suppliers: Supplier[];
  onSubmit: (requestData: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const CreateRequestPage: React.FC<CreateRequestPageProps> = ({
  suppliers,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  // Natural language prompt
  const [naturalText, setNaturalText] = useState(
    'I need 100 ergonomic office chairs, black, delivery within 15 days, budget around ₹2,50,000.'
  );
  const [isAnalyzingText, setIsAnalyzingText] = useState(false);

  // Structured fields
  const [productService, setProductService] = useState('Ergonomic Office Chairs');
  const [quantity, setQuantity] = useState(100);
  const [unit, setUnit] = useState('Units');
  const [deliveryDays, setDeliveryDays] = useState(15);
  const [maxBudget, setMaxBudget] = useState(250000);
  const [category, setCategory] = useState('Office Furniture');
  const [additionalRequirements, setAdditionalRequirements] = useState(
    'Black mesh, adjustable 3D armrests, lumbar support, commercial BIFMA warranty.'
  );

  // Supplier Targeting
  const [targetingMode, setTargetingMode] = useState<'ALL_RELEVANT' | 'SPECIFIC'>('ALL_RELEVANT');
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>(
    suppliers.map(s => s.id)
  );

  const samplePrompts = [
    {
      title: '100 Office Chairs',
      text: 'I need 100 ergonomic office chairs, black, delivery within 15 days, budget around ₹2,50,000.'
    },
    {
      title: '25 Developer Laptops',
      text: 'Need 25 high-performance developer laptops with 32GB RAM and Core i7, 10 days delivery, budget ₹20,00,000.'
    },
    {
      title: '40 Designer Monitors',
      text: 'Procure 40 units of 27-inch 4K IPS monitors with USB-C display input, delivery within 7 days, max budget ₹9,50,000.'
    }
  ];

  const handleAIUnderstand = async () => {
    if (!naturalText.trim()) return;
    setIsAnalyzingText(true);
    try {
      const data = await api.understandRequirement(naturalText);
      if (data) {
        if (data.product) setProductService(data.product);
        if (data.quantity) setQuantity(Number(data.quantity));
        if (data.unit) setUnit(data.unit);
        if (data.maxBudget) setMaxBudget(Number(data.maxBudget));
        if (data.deliveryRequiredDays) setDeliveryDays(Number(data.deliveryRequiredDays));
        if (data.category) setCategory(data.category);
        if (data.requirements && data.requirements.length > 0) {
          setAdditionalRequirements(data.requirements.join(', '));
        }
      }
    } catch (err) {
      console.warn('AI understanding fallback applied:', err);
    } finally {
      setIsAnalyzingText(false);
    }
  };

  const handleToggleSupplier = (id: string) => {
    setSelectedSupplierIds(prev =>
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      title: `Procurement of ${quantity} ${productService}`,
      productService,
      description: naturalText,
      category,
      requestedQuantity: quantity,
      unit,
      maxBudget,
      currency: 'INR',
      deliveryRequiredDays: deliveryDays,
      additionalRequirements,
      targetSupplierMode: targetingMode,
      assignedSupplierIds: targetingMode === 'SPECIFIC' ? selectedSupplierIds : []
    });
  };

  const relevantSuppliersCount = suppliers.filter(s =>
    s.categories?.some(c => c.toLowerCase() === category.toLowerCase()) ||
    s.name.toLowerCase().includes(productService.toLowerCase()) ||
    (s.productsSupplied && s.productsSupplied.some(p => p.toLowerCase().includes(productService.toLowerCase())))
  ).length || suppliers.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors mb-1 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Create Procurement Requirement
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tell the system what you need. AI will structure it and dispatch RFQs to relevant qualified suppliers.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-semibold text-indigo-700">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>AI Assisted RFP Dispatch</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Tell Us What You Need */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-mono font-bold flex items-center justify-center">
                1
              </span>
              <span>Tell Us What You Need (Natural Language)</span>
            </h2>
            <button
              type="button"
              onClick={handleAIUnderstand}
              disabled={isAnalyzingText || !naturalText.trim()}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAnalyzingText ? 'Analyzing...' : 'AI Understand & Pre-fill'}</span>
            </button>
          </div>

          <textarea
            rows={3}
            value={naturalText}
            onChange={e => setNaturalText(e.target.value)}
            placeholder="e.g. I need 100 ergonomic office chairs, black, delivery within 15 days, budget around ₹2,50,000."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all font-medium"
          />

          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-400 font-medium">Try example:</span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setNaturalText(p.text);
                  if (idx === 0) {
                    setProductService('Ergonomic Office Chairs');
                    setQuantity(100);
                    setDeliveryDays(15);
                    setMaxBudget(250000);
                    setCategory('Office Furniture');
                  } else if (idx === 1) {
                    setProductService('Enterprise Developer Laptops');
                    setQuantity(25);
                    setDeliveryDays(10);
                    setMaxBudget(2000000);
                    setCategory('IT Hardware');
                  } else {
                    setProductService('27-inch 4K IPS Monitors');
                    setQuantity(40);
                    setDeliveryDays(7);
                    setMaxBudget(950000);
                    setCategory('IT Hardware');
                  }
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors font-medium"
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Structured Requirements */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-mono font-bold flex items-center justify-center">
              2
            </span>
            <span>Structured Requirements Specification</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Product / Service Required <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={productService}
                onChange={e => setProductService(e.target.value)}
                placeholder="e.g. Ergonomic Office Chairs"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-hidden focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500 focus:bg-white font-medium"
              >
                <option value="Office Furniture">Office Furniture</option>
                <option value="IT Hardware">IT Hardware</option>
                <option value="Office Equipment">Office Equipment</option>
                <option value="Facilities & Safety">Facilities & Safety</option>
                <option value="General Supplies">General Commercial Supplies</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={quantity}
                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-hidden focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Unit of Measurement
              </label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500 focus:bg-white font-medium"
              >
                <option value="Units">Units / Pieces</option>
                <option value="Sets">Sets</option>
                <option value="Licenses">Licenses</option>
                <option value="Packages">Packages</option>
                <option value="Months">Months (Services)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Required By (Lead Time Days) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min={1}
                  value={deliveryDays}
                  onChange={e => setDeliveryDays(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">Days</span>
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Maximum Budget (INR) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">₹</span>
                <input
                  type="number"
                  required
                  min={100}
                  step={500}
                  value={maxBudget}
                  onChange={e => setMaxBudget(Math.max(100, parseInt(e.target.value) || 100))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-3.5 py-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Additional Specifications & Warranty Preferences
              </label>
              <input
                type="text"
                value={additionalRequirements}
                onChange={e => setAdditionalRequirements(e.target.value)}
                placeholder="Color, dimensions, certifications, minimum warranty terms..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Select Suppliers (Section 9) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-mono font-bold flex items-center justify-center">
                3
              </span>
              <span>Send Request To</span>
            </h2>

            <span className="text-xs text-slate-500 font-mono">
              {targetingMode === 'ALL_RELEVANT'
                ? `${relevantSuppliersCount} Relevant Suppliers Matched`
                : `${selectedSupplierIds.length} Suppliers Selected`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              className={`p-4 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                targetingMode === 'ALL_RELEVANT'
                  ? 'bg-indigo-50/60 border-indigo-300 ring-1 ring-indigo-200'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <input
                type="radio"
                name="targetingMode"
                checked={targetingMode === 'ALL_RELEVANT'}
                onChange={() => setTargetingMode('ALL_RELEVANT')}
                className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                  <span>Send To All Relevant Suppliers</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  AI will match all enrolled suppliers registered under <strong>{category}</strong> to maximize quote competition.
                </p>
              </div>
            </label>

            <label
              className={`p-4 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                targetingMode === 'SPECIFIC'
                  ? 'bg-indigo-50/60 border-indigo-300 ring-1 ring-indigo-200'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <input
                type="radio"
                name="targetingMode"
                checked={targetingMode === 'SPECIFIC'}
                onChange={() => setTargetingMode('SPECIFIC')}
                className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <div className="font-bold text-xs text-slate-900">
                  Select Specific Suppliers
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Choose individual registered suppliers to receive this commercial RFP invitation.
                </p>
              </div>
            </label>
          </div>

          {/* Supplier Checkboxes if SPECIFIC is chosen */}
          {targetingMode === 'SPECIFIC' && (
            <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="text-xs font-semibold text-slate-700 mb-2">Available Qualified Suppliers:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suppliers.map(s => {
                  const isChecked = selectedSupplierIds.includes(s.id);
                  return (
                    <label
                      key={s.id}
                      className={`p-3 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-white border-indigo-300 text-slate-900 shadow-xs'
                          : 'bg-slate-100/60 border-slate-200 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSupplier(s.id)}
                          className="rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <div className="font-bold">{s.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{s.categories?.join(', ')}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-slate-100 text-slate-600">
                        {s.code}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Dispatching RFP to Suppliers...' : 'Dispatch Request to Suppliers'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
