import React from 'react';

export type Badge = { id: string; name: string; icon: string; earned: boolean; tip?: string };

export function BadgeGrid({ badges }: { badges: Badge[] }){
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:12 }}>
      {badges.map(b => (
        <div key={b.id} style={{ padding:12, borderRadius:12, border:'1px solid #e5e7eb', background:'#fff', opacity: b.earned ? 1 : 0.6 }}>
          <div style={{ fontSize:28 }}>{b.icon}</div>
          <div style={{ fontWeight:600 }}>{b.name}</div>
          {!b.earned && b.tip && <div style={{ fontSize:12, color:'#64748b', marginTop:4 }}>How to earn: {b.tip}</div>}
        </div>
      ))}
    </div>
  );
}

