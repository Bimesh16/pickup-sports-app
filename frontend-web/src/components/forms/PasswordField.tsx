import React from 'react';
import { Eye, EyeOff, Lock, Sparkles } from 'lucide-react';

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string | null;
  helperText?: string;
  showStrength?: boolean;
  onGenerate?: () => void;
};

export default function PasswordField({ id, label, value, onChange, placeholder, error, helperText, showStrength, onGenerate }: Props) {
  const [show, setShow] = React.useState(false);

  const strength = React.useMemo(() => {
    if (!showStrength) return 0;
    let s = 0;
    if (value.length >= 8) s++;
    if (/[A-Z]/.test(value)) s++;
    if (/[a-z]/.test(value)) s++;
    if (/[0-9]/.test(value)) s++;
    if (/[^A-Za-z0-9]/.test(value)) s++;
    return s;
  }, [value, showStrength]);

  const base = 'block w-full rounded-xl bg-white/90 backdrop-blur px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm ring-1 ring-inset ring-white/30 focus:outline-none';
  const ring = error ? ' ring-2 ring-red-500' : '';

  return (
    <div>
      <label className="text-sm font-medium text-white/90" htmlFor={id}>{label}</label>
      <div className="mt-1 flex items-center gap-2">
        <div className="rounded-xl bg-white/10 p-2 ring-1 ring-inset ring-white/10"><Lock className="h-4 w-4" /></div>
        <input
          id={id}
          name={id}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={base + ring}
        />
        <button type="button" onClick={() => setShow(!show)} className="rounded-xl bg-white/10 p-2 ring-1 ring-inset ring-white/10 hover:bg-white/20 transition-colors">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
        {onGenerate && (
          <button type="button" onClick={onGenerate} className="rounded-xl bg-white/10 p-2 ring-1 ring-inset ring-white/10 hover:bg-white/20 transition-colors" title="Suggest strong password">
            <Sparkles className="h-4 w-4" />
          </button>
        )}
      </div>
      {error ? (
        <p className="mt-1 text-sm text-red-300/90">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-sm text-white/70">{helperText}</p>
      ) : null}

      {showStrength && value && (
        <div className="mt-2">
          <div className="flex gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className={`h-1 flex-1 rounded ${
                i < strength ? (strength < 3 ? 'bg-red-500' : strength < 4 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-gray-300'
              }`} />
            ))}
          </div>
          <p className="text-xs text-white/70 mt-1">
            {strength < 3 ? 'Weak password' : strength < 4 ? 'Good password' : 'Strong password'}
          </p>
        </div>
      )}
    </div>
  );
}

