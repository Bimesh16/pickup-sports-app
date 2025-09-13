import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, UserPlus, Mail, Lock, User, ShieldCheck, ChevronRight, Apple, Chrome } from "lucide-react";

// Game Entrance Auth — Sign-In + Registration in a single component
// Theme: Stadium Tunnel / "Game Entrance"
// Notes:
// - TailwindCSS for styling
// - Framer Motion for subtle animations
// - Accessible labels + helper text
// - Drop-in: place inside a route like /auth
// - Wire onSubmit handlers to your API
// - Replace social button handlers with your OAuth flow

// Props allow integrators to hook backend calls without editing core UI
interface Props {
  onSignIn?: (payload: { email: string; password: string }) => Promise<void> | void;
  onRegister?: (payload: { name: string; email: string; password: string; sport?: string }) => Promise<void> | void;
  isLoading?: boolean;
  countdownTo?: Date; // next match start time; optional
}

const fieldBase =
  "block w-full rounded-xl bg-white/90 backdrop-blur px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm ring-1 ring-inset ring-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition";

const labelBase = "text-sm font-medium text-white/90";

const pillBtn =
  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-lg ring-1 ring-white/20 transition active:translate-y-[1px]";

const ghostBtn =
  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-white/80 hover:text-white ring-1 ring-white/20 hover:ring-white/40 transition";

export default function GameEntranceAuth({ onSignIn, onRegister, isLoading, countdownTo }: Props) {
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [error, setError] = useState<string | null>(null);

  // simple countdown (optional UX candy)
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
      {/* Glowing gradient backdrop */}
      <TunnelBackdrop />

      {/* Top Bar */}
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

      {/* Center card */}
      <div className="relative z-10 mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center px-6 md:grid-cols-2 md:gap-10">
        {/* Copy / Hero side */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden md:block"
        >
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">
            Ready to <span className="text-emerald-400">step onto the field</span>?
          </h1>
          <p className="mt-4 max-w-md text-white/70">
            Log in to catch who&apos;s playing today, or claim your spot by creating an account. Your team is waiting.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setMode("signin")}
              className={`${pillBtn} ${mode === "signin" ? "bg-emerald-500/90 text-slate-950" : "bg-white/10 text-white hover:bg-white/20"}`}
            >
              <LogIn className="h-4 w-4" /> Sign in
            </button>
            <button
              onClick={() => setMode("register")}
              className={`${pillBtn} ${mode === "register" ? "bg-emerald-500/90 text-slate-950" : "bg-white/10 text-white hover:bg-white/20"}`}
            >
              <UserPlus className="h-4 w-4" /> Join the league
            </button>
          </div>
        </motion.div>

        {/* Forms */}
        <AnimatePresence mode="wait">
          {mode === "signin" ? (
            <motion.div
              key="signin"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35 }}
              className="mx-auto w-full max-w-md"
            >
              <FormShell
                title="Back in the game?"
                subtitle="Log in to see nearby games and teammates."
                badge="Game Entrance"
              >
                <SignInForm
                  isLoading={!!isLoading}
                  onSubmit={async (payload) => {
                    setError(null);
                    try {
                      await onSignIn?.(payload);
                    } catch (e: any) {
                      setError(e?.message || "That move won’t score. Try again!");
                    }
                  }}
                />
                {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
                <div className="mt-6 flex items-center justify-between">
                  <button className={ghostBtn} onClick={() => setMode("register")}>New here? Create account</button>
                  <a className={ghostBtn} href="#/forgot">Forgot password</a>
                </div>
              </FormShell>
            </motion.div>
          ) : (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.35 }}
              className="mx-auto w-full max-w-md"
            >
              <FormShell
                title="Your player badge"
                subtitle="Fill this out and step onto the field."
                badge="Game Entrance"
              >
                <RegisterForm
                  isLoading={!!isLoading}
                  onSubmit={async (payload) => {
                    setError(null);
                    try {
                      await onRegister?.(payload);
                    } catch (e: any) {
                      setError(e?.message || "Assistant coach says: check your details ✍️");
                    }
                  }}
                />
                {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
                <div className="mt-6 flex items-center justify-between">
                  <button className={ghostBtn} onClick={() => setMode("signin")}>Already on the roster? Sign in</button>
                </div>
              </FormShell>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer microcopy */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-3 pb-6 text-xs text-white/60">
        <span className="hidden md:inline">Protected by rate limits & best practices ·</span>
        <span>Be kind. Play fair. ⚽</span>
      </div>
    </div>
  );
}

function TunnelBackdrop() {
  // concentric rings to simulate a glowing tunnel
  const rings = new Array(6).fill(0);
  return (
    <div aria-hidden className="absolute inset-0">
      {/* gradient wash */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.25),transparent_60%)]" />
      {/* moving haze */}
      <motion.div
        className="absolute -inset-40 bg-[conic-gradient(from_0deg,rgba(16,185,129,0.15),transparent_40%,rgba(59,130,246,0.12),transparent_70%,rgba(16,185,129,0.15))] blur-3xl"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />
      {/* rings */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {rings.map((_, i) => (
          <div
            key={i}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10`} 
            style={{
              width: 280 + i * 140,
              height: 280 + i * 140,
              left: 0,
              top: 0,
              boxShadow: "0 0 30px rgba(16,185,129,0.15)",
            }}
          />
        ))}
      </div>
      {/* subtle stripes */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.5))]" />
    </div>
  );
}

function FormShell({ title, subtitle, badge, children }: { title: string; subtitle: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl ring-1 ring-white/10"
      >
        {badge && (
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-300/30">
            <ShieldCheck className="h-3.5 w-3.5" /> {badge}
          </div>
        )}
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-white/70">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </motion.div>
      {/* subtle floor glow */}
      <div className="absolute -inset-x-6 -bottom-8 h-24 rounded-full bg-emerald-400/10 blur-2xl" />
    </div>
  );
}

function SignInForm({ onSubmit, isLoading }: { onSubmit: (payload: { email: string; password: string }) => void | Promise<void>; isLoading: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit({ email, password });
      }}
      className="space-y-4"
    >
      <div>
        <label className={labelBase} htmlFor="email">Email</label>
        <div className="mt-1 flex items-center gap-2">
          <div className="rounded-xl bg-white/10 p-2 ring-1 ring-inset ring-white/10"><Mail className="h-4 w-4" /></div>
          <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@club.com" className={fieldBase} value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>
      <div>
        <label className={labelBase} htmlFor="password">Password</label>
        <div className="mt-1 flex items-center gap-2">
          <div className="rounded-xl bg-white/10 p-2 ring-1 ring-inset ring-white/10"><Lock className="h-4 w-4" /></div>
          <input id="password" name="password" type="password" required placeholder="••••••••" className={fieldBase} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className={`${pillBtn} w-full justify-center bg-emerald-400 text-slate-900 hover:bg-emerald-300 focus:ring-emerald-200`}
        >
          <LogIn className="h-4 w-4" /> {isLoading ? "Signing in…" : "Step onto the field"}
        </button>
      </div>

      <SocialRow />
    </form>
  );
}

function RegisterForm({ onSubmit, isLoading }: { onSubmit: (payload: { name: string; email: string; password: string; sport?: string }) => void | Promise<void>; isLoading: boolean }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sport, setSport] = useState("");

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit({ name, email, password, sport: sport || undefined });
      }}
      className="space-y-4"
    >
      <div>
        <label className={labelBase} htmlFor="name">What should we call you on the field?</label>
        <div className="mt-1 flex items-center gap-2">
          <div className="rounded-xl bg-white/10 p-2 ring-1 ring-inset ring-white/10"><User className="h-4 w-4" /></div>
          <input id="name" name="name" required placeholder="Bimesh" className={fieldBase} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
      </div>
      <div>
        <label className={labelBase} htmlFor="reg-email">Email</label>
        <div className="mt-1 flex items-center gap-2">
          <div className="rounded-xl bg-white/10 p-2 ring-1 ring-inset ring-white/10"><Mail className="h-4 w-4" /></div>
          <input id="reg-email" name="email" type="email" autoComplete="email" required placeholder="you@club.com" className={fieldBase} value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>
      <div>
        <label className={labelBase} htmlFor="reg-password">Create a strong password</label>
        <div className="mt-1 flex items-center gap-2">
          <div className="rounded-xl bg-white/10 p-2 ring-1 ring-inset ring-white/10"><Lock className="h-4 w-4" /></div>
          <input id="reg-password" name="password" type="password" required placeholder="••••••••" className={fieldBase} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <p className="mt-1 text-xs text-white/70">Coach tip: at least 8 chars, mix letters & numbers.</p>
      </div>
      <div>
        <label className={labelBase} htmlFor="sport">Preferred sport (optional)</label>
        <input id="sport" name="sport" placeholder="Soccer" className={fieldBase} value={sport} onChange={(e) => setSport(e.target.value)} />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className={`${pillBtn} w-full justify-center bg-emerald-400 text-slate-900 hover:bg-emerald-300 focus:ring-emerald-200`}
        >
          <UserPlus className="h-4 w-4" /> {isLoading ? "Creating badge…" : "Join the league"}
        </button>
      </div>

      <SocialRow />
    </form>
  );
}

function SocialRow() {
  return (
    <div className="mt-5">
      <div className="mb-3 text-center text-xs uppercase tracking-wider text-white/50">or continue with</div>
      <div className="flex items-center justify-center gap-3">
        <button className={`${pillBtn} bg-white text-slate-900 hover:bg-slate-100`} onClick={() => alert("Hook Google OAuth here")}>
          <Chrome className="h-4 w-4" /> Google
        </button>
        <button className={`${pillBtn} bg-white text-slate-900 hover:bg-slate-100`} onClick={() => alert("Hook Apple Sign-In here")}>
          <Apple className="h-4 w-4" /> Apple
        </button>
      </div>
    </div>
  );
}
