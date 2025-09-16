import React from 'react';

const COLORS = ['#E63946', '#3B82F6', '#10B981', '#F4B400', '#6A2F8E'];

export default function ConfettiBurst({ count = 40, duration = 900 }: { count?: number; duration?: number }) {
  const pieces = React.useMemo(() => Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 200,
    rotate: Math.random() * 360,
    color: COLORS[i % COLORS.length],
    size: 6 + Math.round(Math.random() * 6)
  })), [count]);

  React.useEffect(() => {
    const t = setTimeout(() => {
      const el = document.getElementById('confetti-root');
      if (el && el.parentElement) el.parentElement.removeChild(el);
    }, duration + 300);
    return () => clearTimeout(t);
  }, [duration]);

  return (
    <div id="confetti-root" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
      {pieces.map(p => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            position: 'absolute',
            top: '50%',
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 2,
            backgroundColor: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confetti-fall ${duration}ms ease-out ${p.delay}ms forwards`
          }}
        />
      ))}
    </div>
  );
}

