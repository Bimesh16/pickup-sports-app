import React from 'react';

type Props = {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  icon?: React.ReactNode; // left icon container
  helperText?: string;
  error?: string | null;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
};

export default function InputField({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  autoComplete,
  icon,
  helperText,
  error,
  inputProps,
}: Props) {
  const base = 'block w-full rounded-xl bg-white/90 backdrop-blur px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm ring-1 ring-inset ring-white/30 focus:outline-none';
  const ring = error ? ' ring-2 ring-red-500' : '';
  return (
    <div>
      <label className="text-sm font-medium text-white/90" htmlFor={id}>{label}</label>
      <div className="mt-1 flex items-center gap-2">
        {icon && (
          <div className="rounded-xl bg-white/10 p-2 ring-1 ring-inset ring-white/10">
            {icon}
          </div>
        )}
        <input
          id={id}
          name={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className={base + ring}
          {...inputProps}
        />
      </div>
      {error ? (
        <p className="mt-1 text-sm text-red-300/90">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-sm text-white/70">{helperText}</p>
      ) : null}
    </div>
  );
}

