import React from 'react';

export type Session = { id: string; device: string; ip: string; lastActive: string; current?: boolean };

export function SessionList({ sessions, onRevoke }: { sessions: Session[]; onRevoke: (id: string) => void }){
  return (
    <div style={{ border:'1px solid #e5e7eb', borderRadius:12, background:'#fff' }}>
      {sessions.map(s => (
        <div key={s.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:12, borderBottom:'1px solid #e5e7eb' }}>
          <div>
            <div style={{ fontWeight:600 }}>{s.device} {s.current && <span style={{ color:'#16a34a' }}>(This device)</span>}</div>
            <div style={{ color:'#64748b', fontSize:12 }}>{s.ip} · {s.lastActive}</div>
          </div>
          {!s.current && <button onClick={() => onRevoke(s.id)} className="btn-outline" aria-label={`Revoke session ${s.device}`}>Revoke</button>}
        </div>
      ))}
    </div>
  );
}

