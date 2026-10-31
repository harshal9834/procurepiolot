import React, { useState } from 'react';
import { Mail, Lock, Building2, Store, User, ArrowRight, ArrowLeft } from 'lucide-react';

interface RegisterPageProps {
  onRegister: (data: {
    name: string;
    companyName: string;
    email: string;
    password: string;
    role: string;
  }) => Promise<void>;
  onNavigateLogin: () => void;
  isLoading: boolean;
  errorMessage?: string;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onRegister,
  onNavigateLogin,
  isLoading,
  errorMessage
}) => {
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'COMPANY_USER' | 'SUPPLIER'>('COMPANY_USER');
  const [localError, setLocalError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    onRegister({ name, companyName, email, password, role });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-xl shadow-lg shadow-indigo-600/30">
            P
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            ProcurePilot AI
          </h1>
          <p className="text-xs text-slate-400">
            Enterprise procurement intelligence & payment gateway
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-200">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Create your account</h2>
            <p className="text-xs text-slate-500 mt-1">
              Select your role to access customized procurement or vendor workflows.
            </p>
          </div>

          {(localError || errorMessage) && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {localError || errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                I am registering as a
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('COMPANY_USER')}
                  className={`p-3 text-left rounded-xl border text-xs font-semibold transition-all ${
                    role === 'COMPANY_USER'
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-4 h-4 mb-1 text-indigo-600" />
                  <div>Buyer / Company</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">Manage purchasing</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('SUPPLIER')}
                  className={`p-3 text-left rounded-xl border text-xs font-semibold transition-all ${
                    role === 'SUPPLIER'
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Store className="w-4 h-4 mb-1 text-amber-600" />
                  <div>Supplier Vendor</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">Submit quotations</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Rajesh Sharma"
                  className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Company / Business Name
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Technologies Pvt Ltd"
                  className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Business Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              <span>{isLoading ? 'Registering...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <button
              onClick={onNavigateLogin}
              className="text-indigo-600 font-bold hover:underline"
            >
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
