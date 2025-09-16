import React from 'react';
import { Shirt } from 'lucide-react';

export type GenderOptionId = 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';

export type GenderOption = {
  id: GenderOptionId;
  label: string;
  emoji: string;
  accent: string; // hex color string for glow/accent
};

const DEFAULT_OPTIONS: GenderOption[] = [
  { id: 'male', label: 'Male', emoji: '👕', accent: '#3b82f6' },
  { id: 'female', label: 'Female', emoji: '👚', accent: '#ec4899' },
  { id: 'non-binary', label: 'Non-binary', emoji: '⚧️', accent: '#a78bfa' },
  { id: 'prefer-not-to-say', label: 'Prefer not to say', emoji: '🙂', accent: '#9ca3af' },
];

type Props = {
  value?: GenderOptionId | '';
  onChange: (value: GenderOptionId) => void;
  options?: GenderOption[];
  disabled?: boolean;
  size?: 'sm' | 'md';
};

export default function GenderSelector({ value = '', onChange, options = DEFAULT_OPTIONS, disabled, size = 'md' }: Props) {
  const selectedIndex = options.findIndex(o => o.id === value);

  const metrics = size === 'sm'
    ? {
        gridGap: 8,
        padding: '8px 10px',
        radius: 12,
        tile: 36,
        tileRadius: 10,
        labelSize: 13,
        subSize: 11,
        emojiSize: 16,
      }
    : {
        gridGap: 12,
        padding: '10px 12px',
        radius: 16,
        tile: 44,
        tileRadius: 12,
        labelSize: 14,
        subSize: 12,
        emojiSize: 18,
      };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (selectedIndex + 1) % options.length;
      onChange(options[next].id);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = (selectedIndex - 1 + options.length) % options.length;
      onChange(options[prev].id);
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label="Select gender"
      onKeyDown={handleKeyDown}
      style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: metrics.gridGap }}
    >
      {options.map((opt) => {
        const selected = opt.id === value;
        const glow = selected ? `0 8px 24px ${hexWithAlpha(opt.accent, 0.35)}` : '0 2px 8px rgba(0,0,0,0.08)';
        const border = selected ? `2px solid ${opt.accent}` : '1px solid rgba(17,24,39,0.15)';
        const bg = '#ffffff';
        const ring = selected ? `0 0 0 6px ${hexWithAlpha(opt.accent, 0.08)}` : 'none';
        return (
          <button
            key={opt.id}
            role="radio"
            aria-checked={selected}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.id)}
            style={{
              cursor: disabled ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: metrics.gridGap,
              padding: metrics.padding,
              borderRadius: metrics.radius,
              background: bg,
              border,
              boxShadow: `${ring}, ${glow}`,
              transition: 'transform .12s ease, box-shadow .2s ease, border-color .2s ease',
            }}
            onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = 'scale(0.98)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <div
              aria-hidden
              style={{
                position: 'relative',
                width: metrics.tile,
                height: metrics.tile,
                borderRadius: metrics.tileRadius,
                background: `linear-gradient(135deg, ${hexWithAlpha(opt.accent, 0.12)}, ${hexWithAlpha(
                  opt.accent,
                  0.06
                )})`,
                display: 'grid',
                placeItems: 'center',
                border: `1px solid ${hexWithAlpha(opt.accent, 0.4)}`,
              }}
            >
              {/* Jersey icon */}
              <Shirt size={20} color={opt.accent} />
              {/* Overlay emoji */}
              <span style={{ position: 'absolute', bottom: -6, right: -6, fontSize: metrics.emojiSize }}>{opt.emoji}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontWeight: 800, fontSize: metrics.labelSize, color: selected ? opt.accent : '#111827' }}>{opt.label}</span>
              <span style={{ fontSize: metrics.subSize, color: '#6b7280' }}>{selected ? 'Selected' : 'Tap to choose'}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function hexWithAlpha(hex: string, alpha: number) {
  // Accept #rrggbb
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return hex;
  const r = parseInt(m[1], 16);
  const g = parseInt(m[2], 16);
  const b = parseInt(m[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
