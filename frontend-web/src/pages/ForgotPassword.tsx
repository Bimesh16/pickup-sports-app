// src/pages/ForgotPassword.tsx - Simple Forgot Password flow (no-router hash route)

import React, { useState } from 'react';
import { Mail, Phone, ChevronLeft, Zap } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { http } from '@lib/http';
import InputField from '@components/forms/InputField';

export default function ForgotPassword({ onBack }: { onBack?: () => void }) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() && !phone.trim()) {
      setError('Enter your email or phone to receive reset instructions.');
      return;
    }
    try {
      const res = await http<{ message: string; resetToken?: string }>(
        '/auth/forgot-password',
        { method: 'POST', body: JSON.stringify({ email, phone }) },
        false
      );
      setSent(true);
      if (res.resetToken) {
        navigate(`/reset-password?token=${encodeURIComponent(res.resetToken)}`);
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to send reset instructions');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-nepal-blue via-slate-900 to-nepal-crimson text-white">
      {/* Stadium glow overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(230,57,70,0.12),transparent_60%)]" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-5xl grid-cols-1 items-center px-6 md:grid-cols-2 md:gap-10">
        {/* Copy */}
        <div className="hidden md:block">
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">
            Forgot your <span className="text-emerald-400">passcode</span>?
          </h1>
          <p className="mt-4 max-w-md text-white/70">
            No worries—drop your email or phone and we’ll send reset instructions. You’ll be back on the field in no time.
          </p>
        </div>

        {/* Form card */}
        <div className="mx-auto w-full max-w-md">
          <div className="card-frost p-6">
            <div className="mb-4 flex items-center gap-2 text-sm text-white/80">
              <Link to="/login" className="btn btn-outline">
                <ChevronLeft className="h-4 w-4" /> Back to sign in
              </Link>
              </div>
            <h2 className="text-2xl font-bold tracking-tight">Reset your password</h2>
            <p className="mt-1 text-sm text-white/70">Enter email or phone—either works.</p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <InputField
                id="email"
                label="Email"
                type="email"
                placeholder="you@club.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="h-4 w-4" />}
                helperText="Use a valid email so teammates can reach you."
              />
              <InputField
                id="phone"
                label="Phone"
                type="tel"
                placeholder="+977 98XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                icon={<Phone className="h-4 w-4" />}
              />

              {error && <p className="text-sm text-emerald-300/90">{error}</p>}
              {sent && (
                <div className="rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-200 ring-1 ring-emerald-400/20">
                  <Zap className="mr-1 inline h-4 w-4" /> If that account exists, reset instructions are on the way.
                </div>
              )}

              <div className="pt-2">
                <button type="submit" className="btn btn-primary w-full">Send reset link</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
