import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, Building2, Wallet, Store } from 'lucide-react';
import { User } from '../../types';

interface LoginPageProps {
  onLogin: (credentials: { email: string; password: string }) => Promise<void>;
  onNavigateRegister: () => void;
  onNavigateForgotPassword: () => void;
  onNavigateSupplierRegister?: () => void;
  isLoading: boolean;
  errorMessage?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  onNavigateRegister,
  onNavigateForgotPassword,
  onNavigateSupplierRegister,
  isLoading,
  errorMessage
}) => {
  const [email, setEmail] = useState('procurement@acme.test');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ email, password });
  };

  const handleQuickLogin = (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword('demo123');
    onLogin({ email: quickEmail, password: 'demo123' });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-xl shadow-lg shadow-indigo-600/30">
            P
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            ProcurePilot AI
          </h1>
          <p className="text-xs text-slate-400">
            Intelligent procurement. Explainable decisions. Secure payments.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-200">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Sign in to your portal</h2>
            <p className="text-xs text-slate-500 mt-1">
              Select your organization credentials or use demo quick-sign-in below.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
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
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={onNavigateForgotPassword}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-600 font-medium">Remember me for 30 days</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Credentials */}
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-2.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
              Quick 1-Click Role Login
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('procurement@acme.test')}
                className="p-2 text-center rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 transition-colors text-[11px] font-semibold text-slate-700"
              >
                <Building2 className="w-4 h-4 mx-auto mb-1 text-indigo-600" />
                <span>Requester</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('finance@acme.test')}
                className="p-2 text-center rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 transition-colors text-[11px] font-semibold text-slate-700"
              >
                <Wallet className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                <span>Finance</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('supplier-a@test.com')}
                className="p-2 text-center rounded-lg border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-200 transition-colors text-[11px] font-semibold text-slate-700"
              >
                <Store className="w-4 h-4 mx-auto mb-1 text-amber-600" />
                <span>Supplier</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500 space-y-1.5">
            <div>
              Don't have an enterprise account?{' '}
              <button
                type="button"
                onClick={onNavigateRegister}
                className="text-indigo-600 font-bold hover:underline"
              >
                Register your business
              </button>
            </div>
            {onNavigateSupplierRegister && (
              <div className="pt-2 border-t border-slate-100">
                Are you a vendor?{' '}
                <button
                  type="button"
                  id="link-supplier-register"
                  onClick={onNavigateSupplierRegister}
                  className="text-amber-600 font-bold hover:underline"
                >
                  Register as a Supplier
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
