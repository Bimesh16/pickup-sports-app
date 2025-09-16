import React from 'react';

export function InlineEdit({ label, value, onChange, placeholder, onSave }: { label: string; value: string; onChange: (v: string)=>void; placeholder?: string; onSave?: ()=>void }){
  const [editing, setEditing] = React.useState(false);
  const [local, setLocal] = React.useState(value);
  React.useEffect(()=>setLocal(value),[value]);
  return (
    <div>
      <div style={{ fontSize:12, color:'#64748b', marginBottom:4 }}>{label}</div>
      {editing ? (
        <div style={{ display:'flex', gap:8 }}>
          <input value={local} onChange={e=>setLocal(e.target.value)} placeholder={placeholder} style={{ padding:'8px 10px', border:'1px solid #cbd5e1', borderRadius:8 }} />
          <button className="btn-outline" onClick={()=>{ onChange(local); onSave?.(); setEditing(false); }}>Save</button>
          <button className="btn-outline" onClick={()=>{ setLocal(value); setEditing(false); }}>Cancel</button>
        </div>
      ) : (
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div>{value || <span style={{ color:'#94a3b8' }}>{placeholder || '—'}</span>}</div>
          <button className="btn-outline" onClick={()=>setEditing(true)} aria-label={`Edit ${label}`}>Edit</button>
        </div>
      )}
    </div>
  );
}

