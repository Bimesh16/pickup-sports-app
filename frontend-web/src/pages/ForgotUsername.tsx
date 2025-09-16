// src/pages/ForgotUsername.tsx - Simple Forgot Username flow

import React, { useState } from 'react';
import { Mail, Phone, ChevronLeft, ShieldQuestion } from 'lucide-react';
import { http } from '@lib/http';
import InputField from '@components/forms/InputField';

export default function ForgotUsername() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() && !phone.trim()) {
      setError('Enter email or phone so we can send your username.');
      return;
    }
    try {
      await http('/auth/forgot-username', { method: 'POST', body: JSON.stringify({ email, phone }) }, false);
      setSent(true);
      setTimeout(() => setSent(false), 3500);
    } catch (err: any) {
      setError(err?.message || 'Unable to process request');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-nepal-blue via-slate-900 to-nepal-crimson text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(230,57,70,0.12),transparent_60%)]" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-5xl grid-cols-1 items-center px-6 md:grid-cols-2 md:gap-10">
        {sent && (
          <div className="absolute inset-x-0 top-4 z-50 flex justify-center">
            <div className="rounded-full bg-sky-500/20 px-4 py-2 text-sky-200 ring-1 ring-sky-400/30 shadow">
              If the account exists, your username has been sent.
            </div>
          </div>
        )}
        <div className="hidden md:block">
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">
            Forgot your <span className="text-sky-400">username</span>?
          </h1>
          <p className="mt-4 max-w-md text-white/70">
            We’ll send your player tag to your email or phone if it’s on file.
          </p>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="card-frost p-6">
            <div className="mb-4 flex items-center gap-2 text-sm text-white/80">
              <a href="/login" className="btn btn-outline">
                <ChevronLeft className="h-4 w-4" /> Back to sign in
              </a>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Recover your username</h2>
            <p className="mt-1 text-sm text-white/70">Enter an email or phone associated with your account.</p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <InputField
                id="email"
                label="Email"
                type="email"
                placeholder="you@club.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="h-4 w-4" />}
                helperText="We’ll send your username if it’s on file."
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

              {error && <p className="text-sm text-sky-300/90">{error}</p>}
              {sent && (
                <div className="rounded-xl bg-sky-500/10 p-3 text-sm text-sky-200 ring-1 ring-sky-400/20">
                  <ShieldQuestion className="mr-1 inline h-4 w-4" /> If that contact exists, your username has been sent.
                </div>
              )}

              <div className="pt-2">
                <button type="submit" className="btn btn-primary w-full">Send username</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
