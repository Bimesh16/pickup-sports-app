import React from 'react';

type Props = {
  height?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
};

// Nepal jersey hero band with subtle beams + scrim for legibility
export function HeroBand({ height = 220, children, style, className }: Props) {
  return (
    <div style={{ minHeight: height, background: '#f8fafc', position: 'relative', ...style }} className={className}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #1B263B 0%, #003893 60%, #E63946 140%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(110deg, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 8px)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.12) 50%, transparent 100%)' }} />
      {children && (
        <div style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default HeroBand;

