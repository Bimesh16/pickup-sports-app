import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, UserPlus, Mail, Lock, User, ShieldCheck, Apple, Chrome, Link as LinkIcon, ArrowLeft } from "lucide-react";

interface Props {
  onSignIn?: (payload: { email: string; password: string }) => Promise<void> | void;
  onRegister?: (payload: { name: string; email: string; password: string; sport?: string }) => Promise<void> | void;
  onForgotPassword?: (email: string) => Promise<void> | void;
  onVerifyMagicLink?: (email: string) => Promise<void> | void;
  isLoading?: boolean;
  countdownTo?: Date;
}

const fieldBase =
  "block w-full rounded-xl bg-white/90 backdrop-blur px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm ring-1 ring-inset ring-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition";

const labelBase = "text-sm font-medium text-white/90";

const pillBtn =
  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-lg ring-1 ring-white/20 transition active:translate-y-[1px]";

const ghostBtn =
  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-white/80 hover:text-white ring-1 ring-white/20 hover:ring-white/40 transition";

export default function GameEntranceAuth({ onSignIn, onRegister, onForgotPassword, onVerifyMagicLink, isLoading, countdownTo }: Props) {
  const [mode, setMode] = useState<"signin" | "register" | "forgot" | "verify">("signin");
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    if (!countdownTo) return;
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, [countdownTo]);

  const countdown = useMemo(() => {
    if (!countdownTo) return null;
    const ms = Math.max(0, countdownTo.getTime() - now.getTime());
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }, [countdownTo, now]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <TunnelBackdrop />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-6 pt-6">
        <div className="pointer-events-auto select-none rounded-full bg-white/5 px-4 py-1.5 text-xs text-white/80 ring-1 ring-white/10 backdrop-blur">
          <span className="mr-2 inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          Stadium tunnel ready
        </div>
        {countdown && (
          <div className="pointer-events-auto select-none rounded-full bg-white/5 px-4 py-1.5 text-xs text-white/80 ring-1 ring-white/10 backdrop-blur">
            Next kickoff in <span className="ml-2 font-mono text-white">{countdown}</span>
          </div>
        )}
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center px-6 md:grid-cols-2 md:gap-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="hidden md:block">
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">
            Ready to <span className="text-emerald-400">step onto the field</span>?
          </h1>
          <p className="mt-4 max-w-md text-white/70">Log in to catch who&apos;s playing today, or claim your spot by creating an account. Your team is waiting.</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button onClick={() => setMode("signin")} className={`${pillBtn} ${mode === "signin" ? "bg-emerald-500/90 text-slate-950" : "bg-white/10 text-white hover:bg-white/20"}`}><LogIn className="h-4 w-4" /> Sign in</button>
            <button onClick={() => setMode("register")} className={`${pillBtn} ${mode === "register" ? "bg-emerald-500/90 text-slate-950" : "bg-white/10 text-white hover:bg-white/20"}`}><UserPlus className="h-4 w-4" /> Join the league</button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {mode === "signin" && (
            <motion.div key="signin" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35 }} className="mx-auto w-full max-w-md">
              <FormShell title="Back in the game?" subtitle="Log in to see nearby games and teammates." badge="Game Entrance">
                <SignInForm isLoading={!!isLoading} onSubmit={async (payload) => { setError(null); try { await onSignIn?.(payload); } catch (e: any) { setError(e?.message || "That move won’t score. Try again!"); } }} />
                {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
                <div className="mt-6 flex items-center justify-between">
                  <button className={ghostBtn} onClick={() => setMode("register")}>New here? Create account</button>
                  <button className={ghostBtn} onClick={() => setMode("forgot")}>Forgot password</button>
                </div>
              </FormShell>
            </motion.div>
          )}

          {mode === "register" && (
            <motion.div key="register" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.35 }} className="mx-auto w-full max-w-md">
              <FormShell title="Your player badge" subtitle="Fill this out and step onto the field." badge="Game Entrance">
                <RegisterForm isLoading={!!isLoading} onSubmit={async (payload) => { setError(null); try { await onRegister?.(payload); } catch (e: any) { setError(e?.message || "Assistant coach says: check your details ✍️"); } }} />
                {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
                <div className="mt-6 flex items-center justify-between">
                  <button className={ghostBtn} onClick={() => setMode("signin")}>Already on the roster? Sign in</button>
                </div>
              </FormShell>
            </motion.div>
          )}

          {mode === "forgot" && (
            <motion.div key="forgot" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35 }} className="mx-auto w-full max-w-md">
              <FormShell title="Forgot password" subtitle="Enter your email to receive a reset link." badge="Game Entrance">
                <ForgotForm isLoading={!!isLoading} onSubmit={async (email) => { setError(null); try { await onForgotPassword?.(email); setMode("signin"); } catch (e: any) { setError(e?.message || "Couldn’t send reset link."); } }} />
                {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
                <div className="mt-6"><button className={ghostBtn} onClick={() => setMode("signin")}><ArrowLeft className="h-3 w-3" /> Back to sign in</button></div>
              </FormShell>
            </motion.div>
          )}

          {mode === "verify" && (
            <motion.div key="verify" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.35 }} className="mx-auto w-full max-w-md">
              <FormShell title="Verify your email" subtitle="We’ll send a magic link to get you in." badge="Game Entrance">
                <VerifyForm isLoading={!!isLoading} onSubmit={async (email) => { setError(null); try { await onVerifyMagicLink?.(email); setMode("signin"); } catch (e: any) { setError(e?.message || "Couldn’t send magic link."); } }} />
                {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
                <div className="mt-6"><button className={ghostBtn} onClick={() => setMode("signin")}><ArrowLeft className="h-3 w-3" /> Back to sign in</button></div>
              </FormShell>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-3 pb-6 text-xs text-white/60">
        <span className="hidden md:inline">Protected by rate limits & best practices ·</span>
        <span>Be kind. Play fair. ⚽</span>
      </div>
    </div>
  );
}

// Reuse TunnelBackdrop, FormShell, SignInForm, RegisterForm from previous version
// Add ForgotForm + VerifyForm

function TunnelBackdrop() { /* unchanged from previous version */ return <></>; }
function FormShell({ title, subtitle, badge, children }: { title: string; subtitle: string; badge?: string; children: React.ReactNode }) { /* unchanged */ return <>{children}</>; }
function SignInForm({ onSubmit, isLoading }: { onSubmit: (payload: { email: string; password: string }) => void | Promise<void>; isLoading: boolean }) { /* unchanged */ return <></>; }
function RegisterForm({ onSubmit, isLoading }: { onSubmit: (payload: { name: string; email: string; password: string; sport?: string }) => void | Promise<void>; isLoading: boolean }) { /* unchanged */ return <></>; }

function ForgotForm({ onSubmit, isLoading }: { onSubmit: (email: string) => void | Promise<void>; isLoading: boolean }) {
  const [email, setEmail] = useState("");
  return (
    <form onSubmit={async (e) => { e.preventDefault(); await onSubmit(email); }} className="space-y-4">
      <div>
        <label className={labelBase} htmlFor="forgot-email">Email</label>
        <input id="forgot-email" type="email" required placeholder="you@club.com" className={fieldBase} value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <button type="submit" disabled={isLoading} className={`${pillBtn} w-full justify-center bg-emerald-400 text-slate-900`}><LinkIcon className="h-4 w-4" /> {isLoading ? "Sending…" : "Send reset link"}</button>
    </form>
  );
}

function VerifyForm({ onSubmit, isLoading }: { onSubmit: (email: string) => void | Promise<void>; isLoading: boolean }) {
  const [email, setEmail] = useState("");
  return (
    <form onSubmit={async (e) => { e.preventDefault(); await onSubmit(email); }} className="space-y-4">
      <div>
        <label className={labelBase} htmlFor="verify-email">Email</label>
        <input id="verify-email" type="email" required placeholder="you@club.com" className={fieldBase} value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <button type="submit" disabled={isLoading} className={`${pillBtn} w-full justify-center bg-emerald-400 text-slate-900`}><ShieldCheck className="h-4 w-4" /> {isLoading ? "Sending…" : "Send magic link"}</button>
    </form>
  );
}


// =============================
// Forgot Password (request + reset)
// =============================
export function ForgotPasswordCard({
  onRequestReset,
  onConfirmReset,
  isLoading,
  token,
}: {
  onRequestReset: (payload: { email: string }) => Promise<void> | void;
  onConfirmReset: (payload: { token: string; password: string }) => Promise<void> | void;
  isLoading?: boolean;
  token?: string; // if present, show "set new password" view
}) {
  const [mode, setMode] = useState<"request" | "reset">(token ? "reset" : "request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localToken, setLocalToken] = useState(token || "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <TunnelBackdrop />
      <div className="relative z-10 mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center px-6">
        <div className="mx-auto w-full max-w-md">
          <FormShell
            title={mode === "request" ? "Forgot your passcode?" : "Set a new password"}
            subtitle={
              mode === "request"
                ? "We’ll email you a secure reset link."
                : "Enter the code from your email and choose a new password."
            }
            badge="Game Entrance"
          >
            {mode === "request" ? (
              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setError(null);
                  setMessage(null);
                  try {
                    await onRequestReset({ email });
                    setMessage("If that email exists, we’ve sent a reset link.");
                  } catch (err: any) {
                    setError(err?.message || "Couldn’t send reset. Try again.");
                  }
                }}
              >
                <div>
                  <label className={labelBase} htmlFor="fp-email">Email</label>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="rounded-xl bg-white/10 p-2 ring-1 ring-inset ring-white/10"><Mail className="h-4 w-4" /></div>
                    <input id="fp-email" type="email" required placeholder="you@club.com" className={fieldBase} value={email} onChange={(e)=>setEmail(e.target.value)} />
                  </div>
                </div>
                <button disabled={!!isLoading} className={`${pillBtn} w-full justify-center bg-emerald-400 text-slate-900 hover:bg-emerald-300`}>
                  Send reset link
                </button>
              </form>
            ) : (
              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setError(null);
                  setMessage(null);
                  try {
                    await onConfirmReset({ token: localToken, password });
                    setMessage("Password updated. You can sign in now.");
                  } catch (err: any) {
                    setError(err?.message || "Couldn’t update password. Check your code.");
                  }
                }}
              >
                <div>
                  <label className={labelBase} htmlFor="fp-token">Reset code</label>
                  <input id="fp-token" required placeholder="Paste code from email" className={fieldBase} value={localToken} onChange={(e)=>setLocalToken(e.target.value)} />
                </div>
                <div>
                  <label className={labelBase} htmlFor="fp-pass">New password</label>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="rounded-xl bg-white/10 p-2 ring-1 ring-inset ring-white/10"><Lock className="h-4 w-4" /></div>
                    <input id="fp-pass" type="password" required placeholder="••••••••" className={fieldBase} value={password} onChange={(e)=>setPassword(e.target.value)} />
                  </div>
                  <p className="mt-1 text-xs text-white/70">Coach tip: 8+ chars, mix cases, numbers, symbols.</p>
                </div>
                <button disabled={!!isLoading} className={`${pillBtn} w-full justify-center bg-emerald-400 text-slate-900 hover:bg-emerald-300`}>
                  Save new password
                </button>
              </form>
            )}
            {message && <p className="mt-3 text-sm text-emerald-300">{message}</p>}
            {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
            <div className="mt-6 flex items-center justify-between">
              {mode === "request" ? (
                <button className={ghostBtn} onClick={() => setMode("reset")}>Have a code already?</button>
              ) : (
                <button className={ghostBtn} onClick={() => setMode("request")}>Need a new link?</button>
              )}
              <a className={ghostBtn} href="#/auth">Back to sign in</a>
            </div>
          </FormShell>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-3 pb-6 text-xs text-white/60">
        <span>Reset safely. We never email passwords.</span>
      </div>
    </div>
  );
}

// =============================
// Email Verification (magic-link)
// =============================
export function VerifyEmailCard({
  onVerify,
  onResend,
  isLoading,
  token,
  email,
}: {
  onVerify: (payload: { token: string }) => Promise<void> | void;
  onResend: (payload: { email: string }) => Promise<void> | void;
  isLoading?: boolean;
  token?: string; // auto-verify if present
  email?: string; // known email for resend convenience
}) {
  const [localToken, setLocalToken] = useState(token || "");
  const [localEmail, setLocalEmail] = useState(email || "");
  const [status, setStatus] = useState<"idle" | "verifying" | "verified" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const auto = async () => {
      if (!token) return;
      setStatus("verifying");
      try {
        await onVerify({ token });
        setStatus("verified");
        setMessage("Email verified! You can sign in now.");
      } catch (e: any) {
        setStatus("error");
        setMessage(e?.message || "That link seems expired. Resend a new one.");
      }
    };
    auto();
  }, [token, onVerify]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <TunnelBackdrop />
      <div className="relative z-10 mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center px-6">
        <div className="mx-auto w-full max-w-md">
          <FormShell
            title="Verify your email"
            subtitle="Click the magic link we sent, or paste the code below."
            badge="Game Entrance"
          >
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setStatus("verifying");
                setMessage(null);
                try {
                  await onVerify({ token: localToken });
                  setStatus("verified");
                  setMessage("All set! Email verified.");
                } catch (err: any) {
                  setStatus("error");
                  setMessage(err?.message || "Couldn’t verify. Check your code.");
                }
              }}
            >
              <div>
                <label className={labelBase} htmlFor="ve-token">Verification code</label>
                <input id="ve-token" required placeholder="Paste code from email" className={fieldBase} value={localToken} onChange={(e)=>setLocalToken(e.target.value)} />
              </div>
              <button disabled={!!isLoading || status === "verifying"} className={`${pillBtn} w-full justify-center bg-emerald-400 text-slate-900 hover:bg-emerald-300`}>
                {status === "verifying" ? "Verifying…" : "Verify email"}
              </button>
            </form>

            <div className="mt-6">
              <div className="mb-2 text-xs text-white/70">Didn’t get it?</div>
              <form
                className="flex gap-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setMessage(null);
                  try {
                    await onResend({ email: localEmail });
                    setMessage("Sent a fresh link. Check your inbox.");
                  } catch (err: any) {
                    setMessage(err?.message || "Couldn’t resend. Try again.");
                  }
                }}
              >
                <input
                  type="email"
                  required
                  placeholder="you@club.com"
                  className={`${fieldBase} flex-1`}
                  value={localEmail}
                  onChange={(e)=>setLocalEmail(e.target.value)}
                />
                <button className={`${pillBtn} bg-white text-slate-900 hover:bg-slate-100`}>
                  Resend link
                </button>
              </form>
            </div>

            {message && <p className="mt-3 text-sm text-emerald-300">{message}</p>}
            {status === "verified" && (
              <div className="mt-6 flex items-center justify-between">
                <a className={ghostBtn} href="#/auth">Return to sign in</a>
                <span className="text-xs text-white/60">Welcome aboard! ⚽</span>
              </div>
            )}
          </FormShell>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-3 pb-6 text-xs text-white/60">
        <span>Secure by design — verification links expire.</span>
      </div>
    </div>
  );
}
