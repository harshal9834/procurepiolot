import React, { useState } from 'react';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ForgotPasswordPageProps {
  onSubmit: (email: string) => Promise<{ message: string; demoResetToken?: string }>;
  onNavigateLogin: () => void;
  onNavigateReset: (token: string) => void;
  isLoading: boolean;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onSubmit,
  onNavigateLogin,
  onNavigateReset,
  isLoading
}) => {
  const [email, setEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await onSubmit(email);
      setSuccessMsg(res.message);
      if (res.demoResetToken) {
        setResetToken(res.demoResetToken);
      }
    } catch (err) {
      // Ignored for security, message still shown
      setSuccessMsg('If an account exists with this email, a password reset link has been dispatched.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-xl shadow-lg">
            P
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            ProcurePilot AI
          </h1>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-200">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Reset your password</h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your corporate email to receive recovery instructions.
            </p>
          </div>

          {successMsg ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-800 leading-relaxed font-medium">
                  {successMsg}
                </div>
              </div>

              {resetToken && (
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-indigo-950">Development / Demo Mode:</div>
                  <p className="text-xs text-indigo-900">
                    A test token was generated. Click below to proceed to the reset form immediately.
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigateReset(resetToken)}
                    className="w-full py-2 px-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Set New Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={onNavigateLogin}
                className="w-full py-2 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{isLoading ? 'Dispatching Link...' : 'Send Reset Instructions'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={onNavigateLogin}
                  className="text-xs text-slate-500 hover:text-slate-900 font-medium inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to login</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
