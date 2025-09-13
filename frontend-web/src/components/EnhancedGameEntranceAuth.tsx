// src/components/EnhancedGameEntranceAuth.tsx - Ultimate Stadium Entrance with Brand Personality

import React, { useState, useEffect } from "react";
import { LogIn, UserPlus, Mail, Lock, User, ShieldCheck, Apple, Chrome, Facebook, Instagram, Music, Eye, EyeOff, Zap, Trophy, Star, Shirt } from "lucide-react";
import { useAuth } from '@hooks/useAuth';
import { validateForm } from '@lib/validation';
import UnifiedJoinTheLeague from './UnifiedJoinTheLeague';

// Enhanced Game Entrance Auth with full brand personality and gamification
// Theme: Real Stadium Entrance with floodlights, animations, and sports culture

interface Props {
  countdownTo?: Date;
}

const fieldBase =
  "block w-full rounded-xl bg-white/90 backdrop-blur px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm ring-1 ring-inset ring-white/30 focus:outline-none focus:ring-2 focus:ring-nepal-crimson transition-all duration-300 focus:shadow-lg focus:shadow-nepal-crimson/20";

const labelBase = "text-sm font-medium text-white/90";

const pillBtn =
  "inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold shadow-lg ring-1 ring-white/20 transition-all duration-300 active:translate-y-[1px] hover:scale-105";

const ghostBtn =
  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white/80 hover:text-white ring-1 ring-white/20 hover:ring-white/40 transition-all duration-300";

const sportDivider = "flex items-center justify-center gap-2 text-white/60 text-lg my-4";

export default function EnhancedGameEntranceAuth({ countdownTo }: Props) {
  const { login, register, socialLogin, isLoading } = useAuth();
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<"en" | "ne">("en");
  const [showSuccess, setShowSuccess] = useState(false);

  const translations = {
    en: {
      title: "Ready to step onto the field?",
      subtitle: "Log in to catch who's playing today, or claim your spot by creating an account. Your team is waiting in Nepal's sports community.",
      signIn: "Sign in & Play",
      joinLeague: "Join the League",
      backInGame: "Back in the game?",
      logInSubtitle: "Log in to see nearby games and teammates.",
      fillOutSubtitle: "Fill this out and step onto the field.",
      newHere: "New here? Create account",
      forgotPassword: "Forgot password",
      alreadyRoster: "Already on the roster? Sign in",
      protectedBy: "Protected by Rate Limits",
      playFair: "Play Fair",
      secureAuth: "Secure Auth"
    },
    ne: {
      title: "खेल मैदानमा आउन तयार हुनुहुन्छ?",
      subtitle: "आज कसले खेलिरहेको छ हेर्न लगइन गर्नुहोस्, वा खाता बनाएर आफ्नो स्थान दाबी गर्नुहोस्। तपाईंको टोली नेपालको खेल समुदायमा पर्खिरहेको छ।",
      signIn: "लगइन गर्नुहोस् र खेल्नुहोस्",
      joinLeague: "लीगमा सामेल हुनुहोस्",
      backInGame: "खेलमा फर्किए?",
      logInSubtitle: "नजिकैका खेलहरू र साथीहरू हेर्न लगइन गर्नुहोस्।",
      fillOutSubtitle: "यो भरेर मैदानमा आउनुहोस्।",
      newHere: "नयाँ? खाता बनाउनुहोस्",
      forgotPassword: "पासवर्ड बिर्सिए?",
      alreadyRoster: "पहिले नै रोस्टरमा? लगइन गर्नुहोस्",
      protectedBy: "दर सीमा द्वारा सुरक्षित",
      playFair: "निष्पक्ष खेल",
      secureAuth: "सुरक्षित प्रमाणीकरण"
    }
  };

  const t = translations[language];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-nepal-blue via-slate-900 to-nepal-crimson text-white">
      {/* Stadium Floodlights and Motion Lines */}
      <StadiumFloodlights />
      
      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <div className="flex bg-white/10 rounded-full p-1 backdrop-blur">
          <button
            onClick={() => setLanguage("en")}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
              language === "en" ? "bg-nepal-crimson text-white" : "text-white/70 hover:text-white"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage("ne")}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
              language === "ne" ? "bg-nepal-crimson text-white" : "text-white/70 hover:text-white"
            }`}
          >
            ने
          </button>
        </div>
      </div>

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
          <h1 className="text-5xl font-black tracking-tight md:text-6xl leading-tight">
            {t.title.split(' ').map((word, index) => 
              word === 'step' || word === 'onto' || word === 'field' ? (
                <span key={index} className="text-nepal-crimson animate-pulse"> {word}</span>
              ) : (
                <span key={index}> {word}</span>
              )
            )}
          </h1>
          <p className="mt-6 max-w-md text-white/70 text-lg leading-relaxed">
            {t.subtitle}
          </p>
          
          {/* Sport Iconography Divider */}
          <div className={sportDivider}>
            <span>⚽</span>
            <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent flex-1"></div>
            <span>🏀</span>
            <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent flex-1"></div>
            <span>🏐</span>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setMode("signin")}
              className={`${pillBtn} text-lg px-8 py-4 ${
                mode === "signin" 
                  ? "bg-nepal-crimson text-white shadow-lg shadow-nepal-crimson/30" 
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <LogIn className="h-5 w-5" /> {t.signIn}
            </button>
            <button
              onClick={() => setMode("register")}
              className={`${pillBtn} text-lg px-8 py-4 ${
                mode === "register" 
                  ? "bg-nepal-crimson text-white shadow-lg shadow-nepal-crimson/30" 
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <Trophy className="h-5 w-5" /> {t.joinLeague}
            </button>
          </div>
        </div>

        {/* Forms */}
        <div className="mx-auto w-full max-w-md">
          {mode === "register" ? (
            <UnifiedJoinTheLeague 
              onComplete={() => setMode("signin")}
              onBack={() => setMode("signin")}
            />
          ) : mode === "signin" ? (
            <FormShell
              title={t.backInGame}
              subtitle={t.logInSubtitle}
              badge="Game Entrance"
            >
              <SignInForm
                isLoading={isLoading}
                onSubmit={async (payload) => {
                  setError(null);
                  try {
                    await login(payload);
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 3000);
                  } catch (e: any) {
                    setError(e?.message || "That's an offside pass, try again! ⚽");
                  }
                }}
              />
              {error && <p className="mt-3 text-sm text-nepal-crimson font-semibold">{error}</p>}
              <div className="mt-6 flex items-center justify-between">
                <button className={ghostBtn} onClick={() => setMode("register")}>{t.newHere}</button>
                <button className={ghostBtn} onClick={() => alert("Forgot password feature coming soon! Contact support for now.")}>{t.forgotPassword}</button>
              </div>
            </FormShell>
          ) : (
            <FormShell
              title={t.playerBadge}
              subtitle={t.fillOutSubtitle}
              badge="Game Entrance"
            >
              <RegisterForm
                isLoading={isLoading}
                onSubmit={async (payload) => {
                  setError(null);
                  try {
                    await register(payload);
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 3000);
                  } catch (e: any) {
                    setError(e?.message || "Assistant coach says: check your details! 🏆");
                  }
                }}
              />
              {error && <p className="mt-3 text-sm text-nepal-crimson font-semibold">{error}</p>}
              <div className="mt-6 flex items-center justify-between">
                <button className={ghostBtn} onClick={() => setMode("signin")}>{t.alreadyRoster}</button>
              </div>
            </FormShell>
          )}
        </div>
      </div>

      {/* Success Animation */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 text-center animate-bounce">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-nepal-crimson mb-2">You're drafted to the team!</h3>
            <p className="text-gray-600">Welcome to Nepal's sports community!</p>
          </div>
        </div>
      )}

      {/* Mini Scoreboard Footer */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-6 pb-6 text-xs text-white/60">
        <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full backdrop-blur">
          <span>⚽</span>
          <span>{t.protectedBy}</span>
        </div>
        <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full backdrop-blur">
          <span>🛡️</span>
          <span>{t.playFair}</span>
        </div>
        <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full backdrop-blur">
          <span>⏱️</span>
          <span>{t.secureAuth}</span>
        </div>
      </div>
    </div>
  );
}

function StadiumFloodlights() {
  return (
    <div aria-hidden className="absolute inset-0">
      {/* Stadium floodlights */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,20,60,0.4),rgba(0,56,147,0.3),transparent_60%)]" />
      
      {/* Moving floodlight beams */}
      <div className="absolute inset-0 bg-[conic-gradient(from_0deg,rgba(220,20,60,0.2),transparent_45%,rgba(0,56,147,0.2),transparent_90%,rgba(220,20,60,0.2))] animate-spin" style={{ animationDuration: '20s' }} />
      
      {/* Stadium tunnel rings with motion */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30 animate-pulse"
            style={{
              width: 150 + i * 100,
              height: 150 + i * 100,
              left: 0,
              top: 0,
              boxShadow: i % 2 === 0 
                ? "0 0 60px rgba(220,20,60,0.3), 0 0 120px rgba(220,20,60,0.1)" 
                : "0 0 60px rgba(0,56,147,0.3), 0 0 120px rgba(0,56,147,0.1)",
              animationDelay: `${i * 0.5}s`,
              animationDuration: '3s'
            }}
          />
        ))}
      </div>
      
      {/* Stadium floor with motion lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.7))]" />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_98px,rgba(255,255,255,0.05)_100px)] animate-pulse" />
      
      {/* Floating sport icons */}
      <div className="absolute inset-0 overflow-hidden">
        {['⚽', '🏀', '🏐', '⚾', '🎾'].map((icon, i) => (
          <div
            key={i}
            className="absolute text-4xl opacity-20 animate-bounce"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: '4s'
            }}
          >
            {icon}
          </div>
        ))}
      </div>
    </div>
  );
}

function FormShell({ title, subtitle, badge, children }: { title: string; subtitle: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl ring-1 ring-white/10 hover:shadow-3xl hover:shadow-nepal-crimson/10 transition-all duration-500">
        {badge && (
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-nepal-crimson/20 px-3 py-1 text-xs font-semibold text-nepal-crimson ring-1 ring-nepal-crimson/30">
            <ShieldCheck className="h-3.5 w-3.5" /> {badge}
          </div>
        )}
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-white/70">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
      {/* Stadium floor glow */}
      <div className="absolute -inset-x-6 -bottom-8 h-24 rounded-full bg-nepal-crimson/10 blur-2xl" />
    </div>
  );
}

function SignInForm({ onSubmit, isLoading }: { onSubmit: (payload: { username: string; password: string }) => void | Promise<void>; isLoading: boolean }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{username?: string; password?: string}>({});
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validation with sports language
    const newErrors: {username?: string; password?: string} = {};
    if (!username.trim()) {
      newErrors.username = "Username is required to enter the field! ⚽";
    }
    if (!password.trim()) {
      newErrors.password = "Password is required to secure your account! 🛡️";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    await onSubmit({ username, password });
  };

  const handleDemoMode = () => {
    setUsername("demo@example.com");
    setPassword("password123");
    setErrors({});
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
            className={`${fieldBase} ${errors.username ? 'ring-2 ring-nepal-crimson animate-pulse' : ''}`}
            value={username} 
            onChange={(e) => {
              setUsername(e.target.value);
              if (errors.username) setErrors(prev => ({ ...prev, username: undefined }));
            }} 
          />
        </div>
        {errors.username && <p className="mt-1 text-xs text-nepal-crimson font-semibold">{errors.username}</p>}
      </div>
      <div>
        <label className={labelBase} htmlFor="password">Password</label>
        <div className="mt-1 flex items-center gap-2">
          <div className="rounded-xl bg-white/10 p-2 ring-1 ring-inset ring-white/10"><Lock className="h-4 w-4" /></div>
          <input 
            id="password" 
            name="password" 
            type={showPassword ? "text" : "password"}
            placeholder="password123" 
            className={`${fieldBase} ${errors.password ? 'ring-2 ring-nepal-crimson animate-pulse' : ''}`}
            value={password} 
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
            }} 
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="rounded-xl bg-white/10 p-2 ring-1 ring-inset ring-white/10 hover:bg-white/20 transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="mt-1 text-xs text-nepal-crimson font-semibold">{errors.password}</p>}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className={`${pillBtn} w-full justify-center bg-nepal-crimson text-white hover:bg-nepal-crimson/90 focus:ring-nepal-crimson/50 text-lg py-4`}
        >
          <LogIn className="h-5 w-5" /> {isLoading ? "Signing in…" : "Step onto the field"}
        </button>
      </div>
      
      {/* Try Demo Mode Button */}
      <div className="mt-4">
        <button
          type="button"
          onClick={handleDemoMode}
          className="w-full py-3 px-4 bg-gradient-to-r from-nepal-blue to-nepal-crimson text-white rounded-xl font-semibold hover:from-nepal-crimson hover:to-nepal-blue transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <Zap className="h-4 w-4 inline mr-2" />
          Try Demo Mode
        </button>
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
  const [showPassword, setShowPassword] = useState(false);

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);

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
              className={`${fieldBase} ${errors.firstName ? 'ring-2 ring-nepal-crimson' : ''}`}
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
            className={`${fieldBase} ${errors.username ? 'ring-2 ring-nepal-crimson' : ''}`}
            value={formData.username} 
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))} 
          />
        </div>
        {errors.username && <p className="mt-1 text-xs text-nepal-crimson">{errors.username}</p>}
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
            className={`${fieldBase} ${errors.email ? 'ring-2 ring-nepal-crimson' : ''}`}
            value={formData.email} 
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} 
          />
        </div>
        {errors.email && <p className="mt-1 text-xs text-nepal-crimson">{errors.email}</p>}
      </div>

      <div>
        <label className={labelBase} htmlFor="password">Create a strong password</label>
        <div className="mt-1 flex items-center gap-2">
          <div className="rounded-xl bg-white/10 p-2 ring-1 ring-inset ring-white/10"><Lock className="h-4 w-4" /></div>
          <input 
            id="password" 
            name="password" 
            type={showPassword ? "text" : "password"}
            required 
            placeholder="••••••••" 
            className={`${fieldBase} ${errors.password ? 'ring-2 ring-nepal-crimson' : ''}`}
            value={formData.password} 
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))} 
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="rounded-xl bg-white/10 p-2 ring-1 ring-inset ring-white/10 hover:bg-white/20 transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        
        {/* Password Strength Meter */}
        {formData.password && (
          <div className="mt-2">
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded ${
                    i < passwordStrength 
                      ? passwordStrength < 3 
                        ? 'bg-red-500' 
                        : passwordStrength < 4 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-white/70 mt-1">
              {passwordStrength < 3 ? 'Weak password' : passwordStrength < 4 ? 'Good password' : 'Strong password'} 
              {passwordStrength >= 4 && <span className="text-green-400 ml-1">🏆</span>}
            </p>
          </div>
        )}
        
        {errors.password && <p className="mt-1 text-xs text-nepal-crimson">{errors.password}</p>}
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
            className={`${fieldBase} ${errors.phoneNumber ? 'ring-2 ring-nepal-crimson' : ''}`}
            value={formData.phoneNumber} 
            onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))} 
          />
          {errors.phoneNumber && <p className="mt-1 text-xs text-nepal-crimson">{errors.phoneNumber}</p>}
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
            <option value="Futsal">⚽ Futsal</option>
            <option value="Basketball">🏀 Basketball</option>
            <option value="Volleyball">🏐 Volleyball</option>
            <option value="Cricket">🏏 Cricket</option>
            <option value="Football">⚽ Football</option>
            <option value="Badminton">🏸 Badminton</option>
            <option value="Tennis">🎾 Tennis</option>
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
              className={`${fieldBase} ${errors.instagram ? 'ring-2 ring-nepal-crimson' : ''}`}
              value={formData.socialMedia.instagram} 
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                socialMedia: { ...prev.socialMedia, instagram: e.target.value }
              }))} 
            />
            {errors.instagram && <p className="mt-1 text-xs text-nepal-crimson">{errors.instagram}</p>}
          </div>
          <div>
            <label className={labelBase} htmlFor="tiktok">TikTok</label>
            <input 
              id="tiktok" 
              name="tiktok" 
              placeholder="@username" 
              className={`${fieldBase} ${errors.tiktok ? 'ring-2 ring-nepal-crimson' : ''}`}
              value={formData.socialMedia.tiktok} 
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                socialMedia: { ...prev.socialMedia, tiktok: e.target.value }
              }))} 
            />
            {errors.tiktok && <p className="mt-1 text-xs text-nepal-crimson">{errors.tiktok}</p>}
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className={`${pillBtn} w-full justify-center bg-nepal-crimson text-white hover:bg-nepal-crimson/90 focus:ring-nepal-crimson/50 text-lg py-4`}
        >
          <UserPlus className="h-5 w-5" /> {isLoading ? "Creating badge…" : "Join the league"}
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
          className={`${pillBtn} bg-white text-slate-900 hover:bg-slate-100 text-xs hover:animate-bounce`} 
          onClick={() => socialLogin('google')}
        >
          <Chrome className="h-3 w-3" /> Google
        </button>
        <button 
          className={`${pillBtn} bg-white text-slate-900 hover:bg-slate-100 text-xs hover:animate-bounce`} 
          onClick={() => socialLogin('apple')}
        >
          <Apple className="h-3 w-3" /> Apple
        </button>
        <button 
          className={`${pillBtn} bg-blue-600 text-white hover:bg-blue-700 text-xs hover:animate-bounce`} 
          onClick={() => socialLogin('facebook')}
        >
          <Facebook className="h-3 w-3" /> Facebook
        </button>
        <button 
          className={`${pillBtn} bg-pink-500 text-white hover:bg-pink-600 text-xs hover:animate-bounce`} 
          onClick={() => socialLogin('instagram')}
        >
          <Instagram className="h-3 w-3" /> Instagram
        </button>
        <button 
          className={`${pillBtn} bg-black text-white hover:bg-gray-800 text-xs col-span-2 hover:animate-bounce`} 
          onClick={() => socialLogin('tiktok')}
        >
          <Music className="h-3 w-3" /> TikTok
        </button>
      </div>
    </div>
  );
}
