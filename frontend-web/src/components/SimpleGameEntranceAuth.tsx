// src/components/SimpleGameEntranceAuth.tsx - Simplified Stadium Tunnel Auth Component

import React, { useState } from "react";
import { LogIn, UserPlus, Mail, Lock, User, ShieldCheck, Apple, Chrome, Facebook, Instagram, Music } from "lucide-react";
import { useAuth } from '@hooks/useAuth';
import { validateForm } from '@lib/validation';

// Simplified Game Entrance Auth without Framer Motion
// Theme: Stadium Tunnel / "Game Entrance"

interface Props {
  countdownTo?: Date; // next match start time; optional
}

const fieldBase =
  "block w-full rounded-xl bg-white/90 backdrop-blur px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm ring-1 ring-inset ring-white/30 focus:outline-none focus:ring-2 focus:ring-nepal-crimson transition";

const labelBase = "text-sm font-medium text-white/90";

const pillBtn =
  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-lg ring-1 ring-white/20 transition active:translate-y-[1px]";

const ghostBtn =
  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-white/80 hover:text-white ring-1 ring-white/20 hover:ring-white/40 transition";

export default function SimpleGameEntranceAuth({ countdownTo }: Props) {
  const { login, register, socialLogin, isLoading } = useAuth();
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-nepal-blue via-slate-900 to-nepal-crimson text-white">
      {/* Glowing gradient backdrop */}
      <TunnelBackdrop />

      {/* Top Bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-6 pt-6">
        <div className="pointer-events-auto select-none rounded-full bg-white/5 px-4 py-1.5 text-xs text-white/80 ring-1 ring-white/10 backdrop-blur">
          <span className="mr-2 inline-flex h-2 w-2 animate-pulse rounded-full bg-nepal-crimson" />
          खेल मिलन - Stadium tunnel ready
        </div>
        {countdownTo && (
          <div className="pointer-events-auto select-none rounded-full bg-white/5 px-4 py-1.5 text-xs text-white/80 ring-1 ring-white/10 backdrop-blur">
            Next kickoff in <span className="ml-2 font-mono text-white">00:00:00</span>
          </div>
        )}
      </div>

      {/* Center card */}
      <div className="relative z-10 mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center px-6 md:grid-cols-2 md:gap-10">
        {/* Copy / Hero side */}
        <div className="hidden md:block">
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">
            Ready to <span className="text-nepal-crimson">step onto the field</span>?
          </h1>
          <p className="mt-4 max-w-md text-white/70">
            Log in to catch who's playing today, or claim your spot by creating an account. Your team is waiting in Nepal's sports community.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setMode("signin")}
              className={`${pillBtn} ${mode === "signin" ? "bg-nepal-crimson text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
            >
              <LogIn className="h-4 w-4" /> Sign in
            </button>
            <button
              onClick={() => setMode("register")}
              className={`${pillBtn} ${mode === "register" ? "bg-nepal-crimson text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
            >
              <UserPlus className="h-4 w-4" /> Join the league
            </button>
          </div>
        </div>

        {/* Forms */}
        <div className="mx-auto w-full max-w-md">
          {mode === "signin" ? (
            <FormShell
              title="Back in the game?"
              subtitle="Log in to see nearby games and teammates."
              badge="Game Entrance"
            >
              <SignInForm
                isLoading={isLoading}
                onSubmit={async (payload) => {
                  setError(null);
                  try {
                    await login(payload);
                  } catch (e: any) {
                    setError(e?.message || "That move won't score. Try again!");
                  }
                }}
              />
              {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
              <div className="mt-6 flex items-center justify-between">
                <button className={ghostBtn} onClick={() => setMode("register")}>New here? Join the league</button>
                <button className={ghostBtn} onClick={() => alert("Forgot password feature coming soon! Contact support for now.")}>Forgot password</button>
              </div>
            </FormShell>
          ) : (
            <FormShell
              title="Your player badge"
              subtitle="Fill this out and step onto the field."
              badge="Game Entrance"
            >
              <RegisterForm
                isLoading={isLoading}
                onSubmit={async (payload) => {
                  setError(null);
                  try {
                    await register(payload);
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
          )}
        </div>
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
  // concentric rings to simulate a glowing stadium tunnel
  const rings = new Array(8).fill(0);
  return (
    <div aria-hidden className="absolute inset-0">
      {/* Stadium tunnel gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,20,60,0.3),rgba(0,56,147,0.2),transparent_70%)]" />
      {/* Stadium lights effect */}
      <div className="absolute inset-0 bg-[conic-gradient(from_0deg,rgba(220,20,60,0.1),transparent_30%,rgba(0,56,147,0.1),transparent_60%,rgba(220,20,60,0.1))]" />
      {/* Stadium tunnel rings */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {rings.map((_, i) => (
          <div
            key={i}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20`} 
            style={{
              width: 200 + i * 120,
              height: 200 + i * 120,
              left: 0,
              top: 0,
              boxShadow: i % 2 === 0 
                ? "0 0 40px rgba(220,20,60,0.2)" 
                : "0 0 40px rgba(0,56,147,0.2)",
            }}
          />
        ))}
      </div>
      {/* Stadium floor effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.6))]" />
      {/* Stadium tunnel stripes */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_98px,rgba(255,255,255,0.03)_100px)]" />
    </div>
  );
}

function FormShell({ title, subtitle, badge, children }: { title: string; subtitle: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
        {badge && (
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-nepal-crimson/20 px-3 py-1 text-xs font-semibold text-nepal-crimson ring-1 ring-nepal-crimson/30">
            <ShieldCheck className="h-3.5 w-3.5" /> {badge}
          </div>
        )}
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-white/70">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
      {/* subtle floor glow */}
      <div className="absolute -inset-x-6 -bottom-8 h-24 rounded-full bg-nepal-crimson/10 blur-2xl" />
    </div>
  );
}

function SignInForm({ onSubmit, isLoading }: { onSubmit: (payload: { username: string; password: string }) => void | Promise<void>; isLoading: boolean }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{username?: string; password?: string}>({});
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validation
    const newErrors: {username?: string; password?: string} = {};
    if (!username.trim()) {
      newErrors.username = "Username or email is required to enter the field!";
    }
    if (!password.trim()) {
      newErrors.password = "Password is required to secure your account!";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    await onSubmit({ username, password });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelBase} htmlFor="username">Username or Email</label>
        <div className="mt-1 flex items-center gap-2">
          <div className="rounded-xl bg-white/10 p-2 ring-1 ring-inset ring-white/10"><Mail className="h-4 w-4" /></div>
          <input 
            id="username" 
            name="username" 
            type="text" 
            autoComplete="username" 
            placeholder="demo@example.com or demo123" 
            className={`${fieldBase} ${errors.username ? 'ring-2 ring-nepal-crimson' : ''}`}
            value={username} 
            onChange={(e) => {
              setUsername(e.target.value);
              if (errors.username) setErrors(prev => ({ ...prev, username: undefined }));
            }} 
          />
        </div>
        {errors.username && <p className="mt-1 text-xs text-nepal-crimson">{errors.username}</p>}
      </div>
      <div>
        <label className={labelBase} htmlFor="password">Password</label>
        <div className="mt-1 flex items-center gap-2">
          <div className="rounded-xl bg-white/10 p-2 ring-1 ring-inset ring-white/10"><Lock className="h-4 w-4" /></div>
          <input 
            id="password" 
            name="password" 
            type="password" 
            placeholder="password123" 
            className={`${fieldBase} ${errors.password ? 'ring-2 ring-nepal-crimson' : ''}`}
            value={password} 
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
            }} 
          />
        </div>
        {errors.password && <p className="mt-1 text-xs text-nepal-crimson">{errors.password}</p>}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className={`${pillBtn} w-full justify-center bg-nepal-crimson text-white hover:bg-nepal-crimson/90 focus:ring-nepal-crimson/50`}
        >
          <LogIn className="h-4 w-4" /> {isLoading ? "Signing in…" : "Step onto the field"}
        </button>
      </div>
      
      {/* Demo Credentials */}
      <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
        <p className="text-xs text-white/70 mb-2">Demo Credentials:</p>
        <div className="text-xs text-white/60 space-y-1">
          <p><strong>Email:</strong> demo@example.com</p>
          <p><strong>Password:</strong> password123</p>
        </div>
      </div>

      <SocialRow />
    </form>
  );
}

function RegisterForm({ onSubmit, isLoading }: { onSubmit: (payload: any) => void | Promise<void>; isLoading: boolean }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    gender: '',
    phoneNumber: '',
    preferredSport: '',
    location: '',
    socialMedia: {
      instagram: '',
      tiktok: '',
      facebook: '',
      twitter: ''
    }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate form
    const validation = validateForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelBase} htmlFor="firstName">First Name</label>
          <div className="mt-1 flex items-center gap-2">
            <div className="rounded-xl bg-white/10 p-2 ring-1 ring-inset ring-white/10"><User className="h-4 w-4" /></div>
            <input 
              id="firstName" 
              name="firstName" 
              required 
              placeholder="Bimesh" 
              className={fieldBase} 
              value={formData.firstName} 
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))} 
            />
          </div>
        </div>
        <div>
          <label className={labelBase} htmlFor="lastName">Last Name</label>
          <input 
            id="lastName" 
            name="lastName" 
            placeholder="Shrestha" 
            className={fieldBase} 
            value={formData.lastName} 
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))} 
          />
        </div>
      </div>

      <div>
        <label className={labelBase} htmlFor="username">Username</label>
        <div className="mt-1 flex items-center gap-2">
          <div className="rounded-xl bg-white/10 p-2 ring-1 ring-inset ring-white/10"><User className="h-4 w-4" /></div>
          <input 
            id="username" 
            name="username" 
            required 
            placeholder="bimesh123" 
            className={fieldBase} 
            value={formData.username} 
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))} 
          />
        </div>
        {errors.username && <p className="mt-1 text-xs text-red-300">{errors.username}</p>}
      </div>

      <div>
        <label className={labelBase} htmlFor="email">Email</label>
        <div className="mt-1 flex items-center gap-2">
          <div className="rounded-xl bg-white/10 p-2 ring-1 ring-inset ring-white/10"><Mail className="h-4 w-4" /></div>
          <input 
            id="email" 
            name="email" 
            type="email" 
            autoComplete="email" 
            required 
            placeholder="you@club.com" 
            className={fieldBase} 
            value={formData.email} 
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} 
          />
        </div>
        {errors.email && <p className="mt-1 text-xs text-red-300">{errors.email}</p>}
      </div>

      <div>
        <label className={labelBase} htmlFor="password">Create a strong password</label>
        <div className="mt-1 flex items-center gap-2">
          <div className="rounded-xl bg-white/10 p-2 ring-1 ring-inset ring-white/10"><Lock className="h-4 w-4" /></div>
          <input 
            id="password" 
            name="password" 
            type="password" 
            required 
            placeholder="••••••••" 
            className={fieldBase} 
            value={formData.password} 
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))} 
          />
        </div>
        <p className="mt-1 text-xs text-white/70">Coach tip: at least 8 chars, mix letters & numbers.</p>
        {errors.password && <p className="mt-1 text-xs text-red-300">{errors.password}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelBase} htmlFor="gender">Gender</label>
          <select
            id="gender"
            value={formData.gender}
            onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
            className={fieldBase}
          >
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
          </select>
        </div>
        <div>
          <label className={labelBase} htmlFor="phoneNumber">Phone Number</label>
          <input 
            id="phoneNumber" 
            name="phoneNumber" 
            type="tel" 
            placeholder="+977 98XXXXXXXX" 
            className={fieldBase} 
            value={formData.phoneNumber} 
            onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))} 
          />
          {errors.phoneNumber && <p className="mt-1 text-xs text-red-300">{errors.phoneNumber}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelBase} htmlFor="preferredSport">Preferred Sport</label>
          <select
            id="preferredSport"
            value={formData.preferredSport}
            onChange={(e) => setFormData(prev => ({ ...prev, preferredSport: e.target.value }))}
            className={fieldBase}
          >
            <option value="">Select Sport</option>
            <option value="Futsal">Futsal</option>
            <option value="Basketball">Basketball</option>
            <option value="Volleyball">Volleyball</option>
            <option value="Cricket">Cricket</option>
            <option value="Football">Football</option>
            <option value="Badminton">Badminton</option>
            <option value="Tennis">Tennis</option>
          </select>
        </div>
        <div>
          <label className={labelBase} htmlFor="location">Location</label>
          <input 
            id="location" 
            name="location" 
            placeholder="Kathmandu, Nepal" 
            className={fieldBase} 
            value={formData.location} 
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))} 
          />
        </div>
      </div>

      {/* Social Media Section */}
      <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
        <h3 className="text-sm font-medium text-white/90 mb-3">Social Media (Optional)</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelBase} htmlFor="instagram">Instagram</label>
            <input 
              id="instagram" 
              name="instagram" 
              placeholder="@username" 
              className={fieldBase} 
              value={formData.socialMedia.instagram} 
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                socialMedia: { ...prev.socialMedia, instagram: e.target.value }
              }))} 
            />
            {errors.instagram && <p className="mt-1 text-xs text-red-300">{errors.instagram}</p>}
          </div>
          <div>
            <label className={labelBase} htmlFor="tiktok">TikTok</label>
            <input 
              id="tiktok" 
              name="tiktok" 
              placeholder="@username" 
              className={fieldBase} 
              value={formData.socialMedia.tiktok} 
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                socialMedia: { ...prev.socialMedia, tiktok: e.target.value }
              }))} 
            />
            {errors.tiktok && <p className="mt-1 text-xs text-red-300">{errors.tiktok}</p>}
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className={`${pillBtn} w-full justify-center bg-nepal-crimson text-white hover:bg-nepal-crimson/90 focus:ring-nepal-crimson/50`}
        >
          <UserPlus className="h-4 w-4" /> {isLoading ? "Creating badge…" : "Join the league"}
        </button>
      </div>

      <SocialRow />
    </form>
  );
}

function SocialRow() {
  const { socialLogin } = useAuth();
  
  return (
    <div className="mt-5">
      <div className="mb-3 text-center text-xs uppercase tracking-wider text-white/50">or continue with</div>
      <div className="grid grid-cols-2 gap-2">
        <button 
          className={`${pillBtn} bg-white text-slate-900 hover:bg-slate-100 text-xs`} 
          onClick={() => socialLogin('google')}
        >
          <Chrome className="h-3 w-3" /> Google
        </button>
        <button 
          className={`${pillBtn} bg-white text-slate-900 hover:bg-slate-100 text-xs`} 
          onClick={() => socialLogin('apple')}
        >
          <Apple className="h-3 w-3" /> Apple
        </button>
        <button 
          className={`${pillBtn} bg-blue-600 text-white hover:bg-blue-700 text-xs`} 
          onClick={() => socialLogin('facebook')}
        >
          <Facebook className="h-3 w-3" /> Facebook
        </button>
        <button 
          className={`${pillBtn} bg-pink-500 text-white hover:bg-pink-600 text-xs`} 
          onClick={() => socialLogin('instagram')}
        >
          <Instagram className="h-3 w-3" /> Instagram
        </button>
        <button 
          className={`${pillBtn} bg-black text-white hover:bg-gray-800 text-xs col-span-2`} 
          onClick={() => socialLogin('tiktok')}
        >
          <Music className="h-3 w-3" /> TikTok
        </button>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { LogIn, UserPlus, Mail, Lock, User, ShieldCheck, Apple, Chrome, Facebook, Instagram, Music } from "lucide-react";
import { useAuth } from '@hooks/useAuth';
import { validateForm } from '@lib/validation';

// Simplified Game Entrance Auth without Framer Motion
// Theme: Stadium Tunnel / "Game Entrance"

interface Props {
  countdownTo?: Date; // next match start time; optional
}

const fieldBase =
  "block w-full rounded-xl bg-white/90 backdrop-blur px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm ring-1 ring-inset ring-white/30 focus:outline-none focus:ring-2 focus:ring-nepal-crimson transition";

const labelBase = "text-sm font-medium text-white/90";

const pillBtn =
  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-lg ring-1 ring-white/20 transition active:translate-y-[1px]";

const ghostBtn =
  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-white/80 hover:text-white ring-1 ring-white/20 hover:ring-white/40 transition";

export default function SimpleGameEntranceAuth({ countdownTo }: Props) {
  const { login, register, socialLogin, isLoading } = useAuth();
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-nepal-blue via-slate-900 to-nepal-crimson text-white">
      {/* Glowing gradient backdrop */}
      <TunnelBackdrop />

      {/* Top Bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-6 pt-6">
        <div className="pointer-events-auto select-none rounded-full bg-white/5 px-4 py-1.5 text-xs text-white/80 ring-1 ring-white/10 backdrop-blur">
          <span className="mr-2 inline-flex h-2 w-2 animate-pulse rounded-full bg-nepal-crimson" />
          खेल मिलन - Stadium tunnel ready
        </div>
        {countdownTo && (
          <div className="pointer-events-auto select-none rounded-full bg-white/5 px-4 py-1.5 text-xs text-white/80 ring-1 ring-white/10 backdrop-blur">
            Next kickoff in <span className="ml-2 font-mono text-white">00:00:00</span>
          </div>
        )}
      </div>

      {/* Center card */}
      <div className="relative z-10 mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center px-6 md:grid-cols-2 md:gap-10">
        {/* Copy / Hero side */}
        <div className="hidden md:block">
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">
            Ready to <span className="text-nepal-crimson">step onto the field</span>?
          </h1>
          <p className="mt-4 max-w-md text-white/70">
            Log in to catch who's playing today, or claim your spot by creating an account. Your team is waiting in Nepal's sports community.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setMode("signin")}
              className={`${pillBtn} ${mode === "signin" ? "bg-nepal-crimson text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
            >
              <LogIn className="h-4 w-4" /> Sign in
            </button>
            <button
              onClick={() => setMode("register")}
              className={`${pillBtn} ${mode === "register" ? "bg-nepal-crimson text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
            >
              <UserPlus className="h-4 w-4" /> Join the league
            </button>
          </div>
        </div>

        {/* Forms */}
        <div className="mx-auto w-full max-w-md">
          {mode === "signin" ? (
            <FormShell
              title="Back in the game?"
              subtitle="Log in to see nearby games and teammates."
              badge="Game Entrance"
            >
              <SignInForm
                isLoading={isLoading}
                onSubmit={async (payload) => {
                  setError(null);
                  try {
                    await login(payload);
                  } catch (e: any) {
                    setError(e?.message || "That move won't score. Try again!");
                  }
                }}
              />
              {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
              <div className="mt-6 flex items-center justify-between">
                <button className={ghostBtn} onClick={() => setMode("register")}>New here? Join the league</button>
                <button className={ghostBtn} onClick={() => alert("Forgot password feature coming soon! Contact support for now.")}>Forgot password</button>
              </div>
            </FormShell>
          ) : (
            <FormShell
              title="Your player badge"
              subtitle="Fill this out and step onto the field."
              badge="Game Entrance"
            >
              <RegisterForm
                isLoading={isLoading}
                onSubmit={async (payload) => {
                  setError(null);
                  try {
                    await register(payload);
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
          )}
        </div>
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
  // concentric rings to simulate a glowing stadium tunnel
  const rings = new Array(8).fill(0);
  return (
    <div aria-hidden className="absolute inset-0">
      {/* Stadium tunnel gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,20,60,0.3),rgba(0,56,147,0.2),transparent_70%)]" />
      {/* Stadium lights effect */}
      <div className="absolute inset-0 bg-[conic-gradient(from_0deg,rgba(220,20,60,0.1),transparent_30%,rgba(0,56,147,0.1),transparent_60%,rgba(220,20,60,0.1))]" />
      {/* Stadium tunnel rings */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {rings.map((_, i) => (
          <div
            key={i}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20`} 
            style={{
              width: 200 + i * 120,
              height: 200 + i * 120,
              left: 0,
              top: 0,
              boxShadow: i % 2 === 0 
                ? "0 0 40px rgba(220,20,60,0.2)" 
                : "0 0 40px rgba(0,56,147,0.2)",
            }}
          />
        ))}
      </div>
      {/* Stadium floor effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.6))]" />
      {/* Stadium tunnel stripes */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_98px,rgba(255,255,255,0.03)_100px)]" />
    </div>
  );
}

function FormShell({ title, subtitle, badge, children }: { title: string; subtitle: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
        {badge && (
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-nepal-crimson/20 px-3 py-1 text-xs font-semibold text-nepal-crimson ring-1 ring-nepal-crimson/30">
            <ShieldCheck className="h-3.5 w-3.5" /> {badge}
          </div>
        )}
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-white/70">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
      {/* subtle floor glow */}
      <div className="absolute -inset-x-6 -bottom-8 h-24 rounded-full bg-nepal-crimson/10 blur-2xl" />
    </div>
  );
}

function SignInForm({ onSubmit, isLoading }: { onSubmit: (payload: { username: string; password: string }) => void | Promise<void>; isLoading: boolean }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{username?: string; password?: string}>({});
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validation
    const newErrors: {username?: string; password?: string} = {};
    if (!username.trim()) {
      newErrors.username = "Username or email is required to enter the field!";
    }
    if (!password.trim()) {
      newErrors.password = "Password is required to secure your account!";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    await onSubmit({ username, password });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelBase} htmlFor="username">Username or Email</label>
        <div className="mt-1 flex items-center gap-2">
          <div className="rounded-xl bg-white/10 p-2 ring-1 ring-inset ring-white/10"><Mail className="h-4 w-4" /></div>
          <input 
            id="username" 
            name="username" 
            type="text" 
            autoComplete="username" 
            placeholder="demo@example.com or demo123" 
            className={`${fieldBase} ${errors.username ? 'ring-2 ring-nepal-crimson' : ''}`}
            value={username} 
            onChange={(e) => {
              setUsername(e.target.value);
              if (errors.username) setErrors(prev => ({ ...prev, username: undefined }));
            }} 
          />
        </div>
        {errors.username && <p className="mt-1 text-xs text-nepal-crimson">{errors.username}</p>}
      </div>
      <div>
        <label className={labelBase} htmlFor="password">Password</label>
        <div className="mt-1 flex items-center gap-2">
          <div className="rounded-xl bg-white/10 p-2 ring-1 ring-inset ring-white/10"><Lock className="h-4 w-4" /></div>
          <input 
            id="password" 
            name="password" 
            type="password" 
            placeholder="password123" 
            className={`${fieldBase} ${errors.password ? 'ring-2 ring-nepal-crimson' : ''}`}
            value={password} 
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
            }} 
          />
        </div>
        {errors.password && <p className="mt-1 text-xs text-nepal-crimson">{errors.password}</p>}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className={`${pillBtn} w-full justify-center bg-nepal-crimson text-white hover:bg-nepal-crimson/90 focus:ring-nepal-crimson/50`}
        >
          <LogIn className="h-4 w-4" /> {isLoading ? "Signing in…" : "Step onto the field"}
        </button>
      </div>
      
      {/* Demo Credentials */}
      <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
        <p className="text-xs text-white/70 mb-2">Demo Credentials:</p>
        <div className="text-xs text-white/60 space-y-1">
          <p><strong>Email:</strong> demo@example.com</p>
          <p><strong>Password:</strong> password123</p>
        </div>
      </div>

      <SocialRow />
    </form>
  );
}

function RegisterForm({ onSubmit, isLoading }: { onSubmit: (payload: any) => void | Promise<void>; isLoading: boolean }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    gender: '',
    phoneNumber: '',
    preferredSport: '',
    location: '',
    socialMedia: {
      instagram: '',
      tiktok: '',
      facebook: '',
      twitter: ''
    }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate form
    const validation = validateForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelBase} htmlFor="firstName">First Name</label>
          <div className="mt-1 flex items-center gap-2">
            <div className="rounded-xl bg-white/10 p-2 ring-1 ring-inset ring-white/10"><User className="h-4 w-4" /></div>
            <input 
              id="firstName" 
              name="firstName" 
              required 
              placeholder="Bimesh" 
              className={fieldBase} 
              value={formData.firstName} 
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))} 
            />
          </div>
        </div>
        <div>
          <label className={labelBase} htmlFor="lastName">Last Name</label>
          <input 
            id="lastName" 
            name="lastName" 
            placeholder="Shrestha" 
            className={fieldBase} 
            value={formData.lastName} 
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))} 
          />
        </div>
      </div>

      <div>
        <label className={labelBase} htmlFor="username">Username</label>
        <div className="mt-1 flex items-center gap-2">
          <div className="rounded-xl bg-white/10 p-2 ring-1 ring-inset ring-white/10"><User className="h-4 w-4" /></div>
          <input 
            id="username" 
            name="username" 
            required 
            placeholder="bimesh123" 
            className={fieldBase} 
            value={formData.username} 
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))} 
          />
        </div>
        {errors.username && <p className="mt-1 text-xs text-red-300">{errors.username}</p>}
      </div>

      <div>
        <label className={labelBase} htmlFor="email">Email</label>
        <div className="mt-1 flex items-center gap-2">
          <div className="rounded-xl bg-white/10 p-2 ring-1 ring-inset ring-white/10"><Mail className="h-4 w-4" /></div>
          <input 
            id="email" 
            name="email" 
            type="email" 
            autoComplete="email" 
            required 
            placeholder="you@club.com" 
            className={fieldBase} 
            value={formData.email} 
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} 
          />
        </div>
        {errors.email && <p className="mt-1 text-xs text-red-300">{errors.email}</p>}
      </div>

      <div>
        <label className={labelBase} htmlFor="password">Create a strong password</label>
        <div className="mt-1 flex items-center gap-2">
          <div className="rounded-xl bg-white/10 p-2 ring-1 ring-inset ring-white/10"><Lock className="h-4 w-4" /></div>
          <input 
            id="password" 
            name="password" 
            type="password" 
            required 
            placeholder="••••••••" 
            className={fieldBase} 
            value={formData.password} 
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))} 
          />
        </div>
        <p className="mt-1 text-xs text-white/70">Coach tip: at least 8 chars, mix letters & numbers.</p>
        {errors.password && <p className="mt-1 text-xs text-red-300">{errors.password}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelBase} htmlFor="gender">Gender</label>
          <select
            id="gender"
            value={formData.gender}
            onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
            className={fieldBase}
          >
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
          </select>
        </div>
        <div>
          <label className={labelBase} htmlFor="phoneNumber">Phone Number</label>
          <input 
            id="phoneNumber" 
            name="phoneNumber" 
            type="tel" 
            placeholder="+977 98XXXXXXXX" 
            className={fieldBase} 
            value={formData.phoneNumber} 
            onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))} 
          />
          {errors.phoneNumber && <p className="mt-1 text-xs text-red-300">{errors.phoneNumber}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelBase} htmlFor="preferredSport">Preferred Sport</label>
          <select
            id="preferredSport"
            value={formData.preferredSport}
            onChange={(e) => setFormData(prev => ({ ...prev, preferredSport: e.target.value }))}
            className={fieldBase}
          >
            <option value="">Select Sport</option>
            <option value="Futsal">Futsal</option>
            <option value="Basketball">Basketball</option>
            <option value="Volleyball">Volleyball</option>
            <option value="Cricket">Cricket</option>
            <option value="Football">Football</option>
            <option value="Badminton">Badminton</option>
            <option value="Tennis">Tennis</option>
          </select>
        </div>
        <div>
          <label className={labelBase} htmlFor="location">Location</label>
          <input 
            id="location" 
            name="location" 
            placeholder="Kathmandu, Nepal" 
            className={fieldBase} 
            value={formData.location} 
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))} 
          />
        </div>
      </div>

      {/* Social Media Section */}
      <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
        <h3 className="text-sm font-medium text-white/90 mb-3">Social Media (Optional)</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelBase} htmlFor="instagram">Instagram</label>
            <input 
              id="instagram" 
              name="instagram" 
              placeholder="@username" 
              className={fieldBase} 
              value={formData.socialMedia.instagram} 
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                socialMedia: { ...prev.socialMedia, instagram: e.target.value }
              }))} 
            />
            {errors.instagram && <p className="mt-1 text-xs text-red-300">{errors.instagram}</p>}
          </div>
          <div>
            <label className={labelBase} htmlFor="tiktok">TikTok</label>
            <input 
              id="tiktok" 
              name="tiktok" 
              placeholder="@username" 
              className={fieldBase} 
              value={formData.socialMedia.tiktok} 
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                socialMedia: { ...prev.socialMedia, tiktok: e.target.value }
              }))} 
            />
            {errors.tiktok && <p className="mt-1 text-xs text-red-300">{errors.tiktok}</p>}
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className={`${pillBtn} w-full justify-center bg-nepal-crimson text-white hover:bg-nepal-crimson/90 focus:ring-nepal-crimson/50`}
        >
          <UserPlus className="h-4 w-4" /> {isLoading ? "Creating badge…" : "Join the league"}
        </button>
      </div>

      <SocialRow />
    </form>
  );
}

function SocialRow() {
  const { socialLogin } = useAuth();
  
  return (
    <div className="mt-5">
      <div className="mb-3 text-center text-xs uppercase tracking-wider text-white/50">or continue with</div>
      <div className="grid grid-cols-2 gap-2">
        <button 
          className={`${pillBtn} bg-white text-slate-900 hover:bg-slate-100 text-xs`} 
          onClick={() => socialLogin('google')}
        >
          <Chrome className="h-3 w-3" /> Google
        </button>
        <button 
          className={`${pillBtn} bg-white text-slate-900 hover:bg-slate-100 text-xs`} 
          onClick={() => socialLogin('apple')}
        >
          <Apple className="h-3 w-3" /> Apple
        </button>
        <button 
          className={`${pillBtn} bg-blue-600 text-white hover:bg-blue-700 text-xs`} 
          onClick={() => socialLogin('facebook')}
        >
          <Facebook className="h-3 w-3" /> Facebook
        </button>
        <button 
          className={`${pillBtn} bg-pink-500 text-white hover:bg-pink-600 text-xs`} 
          onClick={() => socialLogin('instagram')}
        >
          <Instagram className="h-3 w-3" /> Instagram
        </button>
        <button 
          className={`${pillBtn} bg-black text-white hover:bg-gray-800 text-xs col-span-2`} 
          onClick={() => socialLogin('tiktok')}
        >
          <Music className="h-3 w-3" /> TikTok
        </button>
      </div>
    </div>
  );
}
