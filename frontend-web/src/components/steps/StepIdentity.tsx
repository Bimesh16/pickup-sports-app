// src/components/steps/StepIdentity.tsx - Step 1: Identity Information

import React, { useState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff, Check, X } from 'lucide-react';
import { StepIdentityProps } from '../../types/registration';
import { validateStep, checkUsernameAvailability, getPasswordStrength } from '../../lib/validationSchema';

const StepIdentity: React.FC<StepIdentityProps & { onAvailabilityChange?: (name: string, available: boolean) => void }> = ({
  formData,
  setFormData,
  errors,
  onSuggest,
  onAvailabilityChange
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const passwordStrength = getPasswordStrength(formData.password);
  const pwHasLen = formData.password.length >= 8;
  const pwHasNum = /\d/.test(formData.password);
  const pwHasSym = /[^A-Za-z0-9]/.test(formData.password);

  // Check username availability with debouncing
  useEffect(() => {
    if (!formData.username || formData.username.length < 3) {
      setUsernameAvailable(null);
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setUsernameChecking(true);
      try {
        const available = await checkUsernameAvailability(formData.username);
        setUsernameAvailable(available);
        try { onAvailabilityChange && onAvailabilityChange(formData.username.toLowerCase(), available); } catch {}
        
        if (!available) {
          // Generate suggestions
          const base = formData.username.toLowerCase();
          const suggestions = [
            `${base}${Math.floor(Math.random() * 100)}`,
            `${base}_${Math.floor(Math.random() * 100)}`,
            `${base}${Math.floor(Math.random() * 1000)}`,
            `${base}_player`,
            `${base}_${new Date().getFullYear()}`
          ];
          setSuggestions(suggestions.slice(0, 3));
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Username check failed:', error);
        setUsernameAvailable(null);
      } finally {
        setUsernameChecking(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.username]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleanValue = value.replace(/[^a-zA-Z0-9_]/g, '');
    setFormData((prev: any) => ({ ...prev, username: cleanValue }));
    // Reset availability when user edits
    setUsernameAvailable(null);
  };

  const handleUsernameBlur = () => {
    if (formData.username) {
      const cleanValue = formData.username.toLowerCase();
      setFormData((prev: any) => ({ ...prev, username: cleanValue }));
      // Propagate latest known availability state
      try { onAvailabilityChange && onAvailabilityChange(cleanValue, usernameAvailable === true); } catch {}
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFormData((prev: any) => ({ ...prev, username: suggestion }));
    onSuggest(suggestion);
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength <= 2) return 'text-red-500';
    if (strength <= 3) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="space-y-6">
      {/* First Name */}
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-[#E9EEF5] mb-2">
          First Name <span className="text-nepal-crimson">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#C7D1E0]" />
          <input
            type="text"
            placeholder="Your first name"
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, firstName: e.target.value }))}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nepal-crimson focus:border-transparent transition-all bg-white text-gray-900 placeholder-[#95A3B6]"
          />
        </div>
        {errors?.firstName && (
          <p className="mt-1 text-sm text-nepal-crimson">{errors.firstName}</p>
        )}
      </div>

      {/* Last Name */}
      <div>
        <label htmlFor="lastName" className="block text-sm font-medium text-[#E9EEF5] mb-2">
          Last Name <span className="text-nepal-crimson">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#C7D1E0]" />
          <input
            type="text"
            placeholder="Your last name"
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, lastName: e.target.value }))}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nepal-crimson focus:border-transparent transition-all bg-white text-gray-900 placeholder-[#95A3B6]"
          />
        </div>
        {errors?.lastName && (
          <p className="mt-1 text-sm text-nepal-crimson">{errors.lastName}</p>
        )}
      </div>

      {/* Username */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-[#E9EEF5] mb-2">
          Player Tag *
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#C7D1E0]" />
          <input
            type="text"
            placeholder="Choose your player tag"
            id="username"
            value={formData.username}
            onChange={handleUsernameChange}
            onBlur={handleUsernameBlur}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nepal-crimson focus:border-transparent transition-all bg-white text-gray-900 placeholder-[#95A3B6]"
            aria-describedby="username-availability-help"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {usernameChecking ? (
              <div className="animate-spin h-4 w-4 border-2 border-nepal-crimson border-t-transparent rounded-full" />
            ) : usernameAvailable === true ? (
              <>
                <Check className="h-4 w-4 text-green-500" data-testid="username-available" />
                <span className="text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Available</span>
              </>
            ) : usernameAvailable === false ? (
              <>
                <X className="h-4 w-4 text-red-500" />
                <span className="text-[10px] font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded">Taken</span>
              </>
            ) : null}
          </div>
        </div>
        {/* Live availability for screen readers and subtle helper for sighted users (moved under username) */}
        <p id="username-availability-help" className="mt-1 text-xs" aria-live="polite" role="status">
          {usernameAvailable === true && !usernameChecking ? (
            <span className="text-green-400">Tag available</span>
          ) : usernameAvailable === false && !usernameChecking ? (
            <span className="text-nepal-crimson">That tag is taken — try another</span>
          ) : null}
        </p>
        
        {/* Username preview */}
        {formData.username && (
          <p className="mt-1 text-sm text-[#C7D1E0]">
            Your tag: <span className="font-mono text-nepal-crimson">@{formData.username.toLowerCase()}</span>
          </p>
        )}

        {/* Username suggestions */}
        {suggestions.length > 0 && (
          <div className="mt-2" aria-live="polite" role="status">
            <p className="text-sm text-[#C7D1E0] mb-2">Tag taken! Try these instead:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1 text-xs bg-nepal-crimson/10 text-nepal-crimson rounded-full hover:bg-nepal-crimson/20 transition-colors"
                >
                  @{suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {errors?.username && (
          <p className="mt-1 text-sm text-nepal-crimson">{errors.username}</p>
        )}
      </div>

      {/* Defense Key */}
      <div>
        <label htmlFor="defenseKey" className="block text-sm font-medium text-[#E9EEF5] mb-2">
          Defense Key (password) <span className="text-nepal-crimson">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#C7D1E0]" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Create your defense key"
            id="defenseKey"
            value={formData.password}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, password: e.target.value }))}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nepal-crimson focus:border-transparent transition-all bg-white text-gray-900 placeholder-[#95A3B6]"
            aria-label="Defense key password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#C7D1E0] hover:text-white"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="mt-1 text-xs text-[#C7D1E0]">8+ chars, number & symbol. Make your defense unbreakable.</p>
        {/* Password rule checklist */}
        <ul className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
          <li className={`${pwHasLen ? 'text-green-400' : 'text-white/70'}`}>{pwHasLen ? '✓' : '•'} 8+ characters</li>
          <li className={`${pwHasNum ? 'text-green-400' : 'text-white/70'}`}>{pwHasNum ? '✓' : '•'} 1 number</li>
          <li className={`${pwHasSym ? 'text-green-400' : 'text-white/70'}`}>{pwHasSym ? '✓' : '•'} 1 symbol</li>
        </ul>
        <button
          type="button"
          onClick={() => {
            // Ensure: >= 12 chars, includes upper, lower, number, symbol
            const uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const lowers = 'abcdefghijklmnopqrstuvwxyz';
            const numbers = '0123456789';
            const symbols = '!@#$%^&*()_+[]{}<>?';
            const all = uppers + lowers + numbers + symbols;

            const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
            // Seed with required classes
            const req = [pick(uppers), pick(lowers), pick(numbers), pick(symbols)];
            // Fill remaining to length
            const targetLen = 14; // stronger default
            for (let i = req.length; i < targetLen; i++) req.push(pick(all));
            // Shuffle
            for (let i = req.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [req[i], req[j]] = [req[j], req[i]];
            }
            const password = req.join('');
            setFormData((prev: any) => ({ ...prev, password }));
          }}
          className="mt-1 text-xs text-nepal-crimson hover:text-nepal-crimson/80 underline"
        >
          Generate strong key
        </button>

        {/* Password strength indicator */}
        {formData.password && (
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/20 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    passwordStrength <= 2 ? 'bg-red-500' : 
                    passwordStrength <= 3 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${(passwordStrength / 5) * 100}%` }}
                />
              </div>
              <span className={`text-xs font-medium ${getPasswordStrengthColor(passwordStrength)}`}>
                {getPasswordStrengthText(passwordStrength)}
              </span>
            </div>
          </div>
        )}


        {errors?.password && (
          <p className="mt-1 text-sm text-nepal-crimson">{errors.password}</p>
        )}
      </div>
    </div>
  );
};

export default StepIdentity;
