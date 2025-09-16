import React from 'react';
import '@styles/premium-ui.css';

export function CompletionMeter({ percent, nudges }: { percent: number; nudges: string[] }){
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div style={{ padding:12, border:'1px solid #e5e7eb', borderRadius:12, background:'#ffffff', color:'#0f172a' }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
        <strong className="text-strong">Profile completeness</strong>
        <span className="text-strong">{p}%</span>
      </div>
      <div style={{ height:10, background:'#e2e8f0', borderRadius:999, overflow:'hidden' }}>
        <div style={{ width:`${p}%`, height:'100%', background:'#22c55e', transition:'width 300ms ease' }} />
      </div>
      {nudges?.length > 0 && (
        <ul style={{ marginTop:8, marginBottom:0, paddingLeft:18 }}>
          {nudges.slice(0,3).map((n,i)=>(<li key={i} className="text-muted" style={{ fontSize:13 }}>{n}</li>))}
        </ul>
      )}
    </div>
  );
}
