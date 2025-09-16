import React from 'react';
import '@styles/premium-ui.css';

export type PlayerCardProps = {
  avatarUrl?: string | null;
  displayName: string;
  username: string;
  level?: string;
  jerseyNumber?: number | string;
  city?: string;
  onEdit?: () => void;
  onShare?: () => void;
  onShowQr?: () => void;
  onCopyInvite?: () => void;
};

export function PlayerCard(props: PlayerCardProps){
  const { avatarUrl, displayName, username, level='BEGINNER', jerseyNumber, city, onEdit, onShare, onShowQr, onCopyInvite } = props;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:16, padding:16, borderRadius:16, background:'#ffffff', border:'1px solid #e5e7eb', boxShadow:'0 4px 16px rgba(15,23,42,0.06)', color:'#0f172a' }}>
      <div style={{ position:'relative' }}>
        <img src={avatarUrl || ''} alt="Avatar" onError={(e:any)=>{e.currentTarget.style.visibility='hidden';}} style={{ width:72, height:72, borderRadius:999, objectFit:'cover', background:'#e5e7eb' }} />
        {jerseyNumber != null && <div style={{ position:'absolute', bottom:-4, right:-4, background:'#111827', color:'#fff', fontSize:12, borderRadius:999, padding:'2px 6px' }}>#{jerseyNumber}</div>}
      </div>
      <div style={{ flex:1 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          <h2 style={{ margin:0, fontSize:20 }}>{displayName}</h2>
          <span className="text-muted">@{username}</span>
          <span style={{ background:'#dcfce7', color:'#166534', fontSize:12, padding:'2px 8px', borderRadius:999 }}>{level}</span>
          {city && <span style={{ color:'#475569', fontSize:12 }}>📍 {city}</span>}
        </div>
        <div style={{ marginTop:8, display:'flex', gap:8, flexWrap:'wrap' }}>
          <button onClick={onEdit} className="btn-outline">Edit Profile</button>
          <button onClick={onShare} className="btn-outline">Share</button>
          <button onClick={onShowQr} className="btn-outline">QR</button>
          <button onClick={onCopyInvite} className="btn-outline">Copy invite</button>
        </div>
      </div>
    </div>
  );
}
