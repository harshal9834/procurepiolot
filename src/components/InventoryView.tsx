import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { Package, Search, MapPin, CheckCircle, RefreshCw } from 'lucide-react';

interface InventoryViewProps {
  items: InventoryItem[];
  onRefresh: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ items, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = items.filter(
    item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.warehouseLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Enterprise Inventory Depots
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            ProcurePilot audits unallocated warehouse stock prior to vendor quotation analysis to avert surplus buildup.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Depots</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Filter by item code, description, or warehouse..."
          className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
        />
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-3.5">Item Code</th>
                <th className="px-6 py-3.5">Product Description</th>
                <th className="px-4 py-3.5">Depot Location</th>
                <th className="px-4 py-3.5 text-right">In Stock</th>
                <th className="px-4 py-3.5 text-right">Reserved</th>
                <th className="px-4 py-3.5 text-right">Available</th>
                <th className="px-4 py-3.5 text-right">Valuation</th>
                <th className="px-6 py-3.5 text-center">Condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-indigo-600">
                    {item.sku}
                  </td>
                  <td className="px-6 py-4 font-sans font-medium text-slate-900">
                    <div>{item.name}</div>
                    <div className="text-[11px] text-slate-500 font-normal">{item.category}</div>
                  </td>
                  <td className="px-4 py-4 font-sans text-slate-600 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{item.warehouseLocation}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right tabular-nums text-slate-700">
                    {item.currentQuantity}
                  </td>
                  <td className="px-4 py-4 text-right tabular-nums text-slate-400">
                    {item.reservedQuantity}
                  </td>
                  <td className="px-4 py-4 text-right tabular-nums font-bold text-emerald-600 text-sm">
                    {item.availableQuantity}
                  </td>
                  <td className="px-4 py-4 text-right tabular-nums text-slate-900">
                    ₹{item.unitCost.toLocaleString('en-IN')}/ea
                  </td>
                  <td className="px-6 py-4 text-center font-sans text-[11px]">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {item.condition}
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
