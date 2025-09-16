// src/pages/ResetPassword.tsx - Set a new password using a token

import React, { useMemo, useState } from 'react';
import { Lock, ChevronLeft, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { http } from '@lib/http';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const initialToken = params.get('token') || '';
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = useMemo(() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[a-z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!token.trim()) return setError('Paste your reset token.');
    if (password !== confirm) return setError('Passwords do not match.');
    if (strength < 3) return setError('Choose a stronger password.');
    try {
      await http('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword: password })
      }, false);
      setSuccess('Password updated. You can now sign in.');
      setTimeout(() => navigate('/login?reset=1'), 1200);
    } catch (err: any) {
      setError(err?.message || 'Could not reset password');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.15),transparent_60%)]" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-5xl grid-cols-1 items-center px-6 md:grid-cols-2 md:gap-10">
        <div className="hidden md:block">
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">Reset your password</h1>
          <p className="mt-4 max-w-md text-white/70">Paste your reset token and set a strong new password.</p>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
            <div className="mb-4 flex items-center gap-2 text-sm text-white/80">
              <Link to="/login" className="inline-flex items-center gap-1 rounded-full px-3 py-1 ring-1 ring-white/20 hover:ring-white/40">
                <ChevronLeft className="h-4 w-4" /> Back to sign in
              </Link>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-white/90">Reset token</label>
                <input
                  className="mt-1 block w-full rounded-xl bg-white/90 backdrop-blur px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm ring-1 ring-inset ring-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="Paste token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-white/90">New password</label>
                <div className="mt-1 flex items-center gap-2">
                  <div className="rounded-xl bg-white/10 p-2 ring-1 ring-inset ring-white/10"><Lock className="h-4 w-4" /></div>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="block w-full rounded-xl bg-white/90 backdrop-blur px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm ring-1 ring-inset ring-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="rounded-xl bg-white/10 p-2 ring-1 ring-inset ring-white/10 hover:bg-white/20"
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password && (
                  <div className="mt-2 flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className={`h-1 flex-1 rounded ${i < strength ? (strength < 3 ? 'bg-red-500' : strength < 4 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-gray-300'}`} />
                    ))}
                  </div>
                )}
                <ul className="mt-2 text-xs text-white/80 space-y-1">
                  <li>• At least 8 characters</li>
                  <li>• Mix of upper and lower case letters</li>
                  <li>• Include a number</li>
                  <li>• Special character for extra strength</li>
                </ul>
              </div>
              <div>
                <label className="text-sm font-medium text-white/90">Confirm password</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    className="block w-full rounded-xl bg-white/90 backdrop-blur px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm ring-1 ring-inset ring-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="rounded-xl bg-white/10 p-2 ring-1 ring-inset ring-white/10 hover:bg-white/20"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-200 ring-1 ring-red-400/20">
                  <AlertCircle className="h-4 w-4" /> {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-200 ring-1 ring-emerald-400/20">
                  <CheckCircle2 className="h-4 w-4" /> {success}
                </div>
              )}

              <div className="pt-2">
                <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-400 px-5 py-3 font-semibold text-slate-900 shadow-lg ring-1 ring-white/20 transition hover:bg-emerald-300">
                  Update password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
