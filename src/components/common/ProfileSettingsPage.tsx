import React, { useState } from 'react';
import { User } from '../../types';
import { UserCircle, Settings, ShieldCheck, Bell, Lock, Building2, Save } from 'lucide-react';

interface ProfileSettingsPageProps {
  currentUser: User;
  onLogout: () => void;
  onSaveProfile: (updates: Partial<User>) => void;
}

export const ProfileSettingsPage: React.FC<ProfileSettingsPageProps> = ({
  currentUser,
  onLogout,
  onSaveProfile
}) => {
  const [name, setName] = useState(currentUser.name);
  const [department, setDepartment] = useState(currentUser.department || 'Operations');
  const [phone, setPhone] = useState(currentUser.phone || '+91 98450 11223');
  const [currency, setCurrency] = useState('INR');
  const [approvalThreshold, setApprovalThreshold] = useState(500000);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({ name, department, phone });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          User Profile & Enterprise Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your contact information, procurement threshold rules, and security preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-center">
          <div className="w-16 h-16 rounded-full bg-indigo-600 text-white font-bold text-xl flex items-center justify-center mx-auto shadow-md">
            {currentUser.avatarInitials}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{currentUser.name}</h2>
            <div className="text-xs text-slate-500 font-mono mt-0.5">{currentUser.email}</div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Organization:</span>
              <span className="font-semibold text-slate-900">{currentUser.companyName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Role:</span>
              <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-indigo-50 text-indigo-700">
                {currentUser.role}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Department:</span>
              <span className="text-slate-900">{department}</span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full py-2 px-3 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors mt-2"
          >
            Log Out of Session
          </button>
        </div>

        {/* Settings Form */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-600" />
                <span>Account & Procurement Configuration</span>
              </h3>
              {savedSuccess && (
                <span className="text-emerald-600 font-bold text-xs">Settings Saved!</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Business Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Base Currency</label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
                >
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="USD">USD ($) - US Dollar</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Default Single-Approver Threshold (INR)
              </label>
              <input
                type="number"
                value={approvalThreshold}
                onChange={e => setApprovalThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
              />
              <span className="text-[10px] text-slate-400">
                Purchases above this threshold require secondary treasury clearance.
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
