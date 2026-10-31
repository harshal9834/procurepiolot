import React, { useState } from 'react';
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ResetPasswordPageProps {
  token?: string;
  onReset: (newPassword: string) => Promise<void>;
  onNavigateLogin: () => void;
  isLoading: boolean;
  errorMessage?: string;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({
  token,
  onReset,
  onNavigateLogin,
  isLoading,
  errorMessage
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      await onReset(password);
      setIsSuccess(true);
    } catch (err: any) {
      setLocalError(err.message || 'Reset failed');
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
          {isSuccess ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Password Reset Complete</h2>
              <p className="text-xs text-slate-500">
                Your credentials have been securely updated. You can now log into your account.
              </p>
              <button
                type="button"
                onClick={onNavigateLogin}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md"
              >
                Proceed to Login
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900">Set new password</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Choose a strong password to protect your corporate procurement authorization.
                </p>
              </div>

              {(localError || errorMessage) && (
                <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                  {localError || errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  <span>{isLoading ? 'Updating Password...' : 'Save New Password'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
