import React, { useState } from 'react';
import { Store, ArrowRight, ShieldCheck, Building2, Mail, Lock, Phone, MapPin, Tag, Globe, CheckCircle2 } from 'lucide-react';
import { api } from '../../api';
import { User } from '../../types';

interface SupplierRegisterPageProps {
  onSuccess: (user: User) => void;
  onNavigateLogin: () => void;
}

export const SupplierRegisterPage: React.FC<SupplierRegisterPageProps> = ({
  onSuccess,
  onNavigateLogin
}) => {
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [products, setProducts] = useState('');
  const [category, setCategory] = useState('Office Furniture');
  const [description, setDescription] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [website, setWebsite] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!companyName.trim() || !email.trim() || !password.trim()) {
      setError('Company Name, Email, and Password are required.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await api.registerSupplier({
        companyName: companyName.trim(),
        contactPerson: contactPerson.trim() || companyName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        address: address.trim(),
        products: products.trim(),
        category,
        description: description.trim(),
        gstNumber: gstNumber.trim(),
        website: website.trim()
      });
      onSuccess(result.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl w-full bg-slate-850 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden bg-slate-900/90 backdrop-blur-md">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-slate-800 bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Supplier Partner Registration</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                  VENDOR ONBOARDING
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Register your business to receive enterprise RFQs, submit quotes, and receive instant PayPal Sandbox disbursements.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}

          {/* Section 1: Business Essentials */}
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Company Information</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Company Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. ABC Office Supplies Ltd"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Contact Person Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={e => setContactPerson(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Corporate Email <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="sales@abcsupplies.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Portal Password <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98000 12345"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Operating City / Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Bengaluru, Karnataka"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Catalog & Capabilities */}
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              <span>Supplied Categories & Products</span>
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Primary Business Category
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="Office Furniture">Office Furniture (Chairs, Desks, Storage)</option>
                    <option value="IT Hardware">IT Hardware (Laptops, Monitors, Peripherals)</option>
                    <option value="Office Equipment">Office Equipment (Printers, Projectors, Cables)</option>
                    <option value="Facilities & Safety">Facilities, Janitorial & Safety Gear</option>
                    <option value="Industrial & Hardware">Industrial, Hardware & Machinery</option>
                    <option value="General Supplies">General Commercial Supplies</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Products & Services Provided
                  </label>
                  <input
                    type="text"
                    value={products}
                    onChange={e => setProducts(e.target.value)}
                    placeholder="e.g. Ergonomic Chairs, Standing Desks, Whiteboards"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Comma-separated products used for automated RFQ matching.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Business Overview / Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Tell buyers about your quality standards, certifications, and delivery guarantees..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    GST / Tax ID <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={e => setGstNumber(e.target.value)}
                    placeholder="29AAAAA0000A1Z5"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Website URL <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    placeholder="https://www.abcsupplies.com"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={onNavigateLogin}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Already registered? <span className="text-indigo-400 font-semibold underline">Sign In</span>
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span>Registering Supplier Profile...</span>
              ) : (
                <>
                  <span>Complete Supplier Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
