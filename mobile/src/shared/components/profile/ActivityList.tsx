import React from 'react';

export type ActivityItem = { id: string; type: 'join'|'rsvp'|'rating'|'badge'; text: string; at: string };

export function ActivityList({ items }: { items: ActivityItem[] }){
  if (!items.length) return <div style={{ padding:16, border:'1px dashed #cbd5e1', borderRadius:12, color:'#475569', background:'#ffffff' }}>No recent activity</div>;
  return (
    <ul style={{ listStyle:'none', margin:0, padding:0, color:'#0f172a' }}>
      {items.map(it => (
        <li key={it.id} style={{ padding:'12px 8px', borderBottom:'1px solid #e5e7eb', display:'flex', justifyContent:'space-between', background:'#ffffff' }}>
          <span>{it.text}</span>
          <span style={{ color:'#64748b', fontSize:12 }}>{it.at}</span>
        </li>
      ))}
    </ul>
  );
}
