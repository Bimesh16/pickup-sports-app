import React from 'react';
import '@styles/premium-ui.css';
import HeroBand from '@components/HeroBand';
import { Card, Button, Modal } from '@components/ui';
import { theme } from '@styles/theme';

const CHANNELS = ['Push','Email','SMS'] as const;
const ROWS = [
  { key:'invites', label:'Game invites' },
  { key:'reminders', label:'Game reminders' },
  { key:'teamchat', label:'Team chat messages' },
  { key:'organizer', label:'Organizer updates' },
  { key:'ratings', label:'Ratings & reviews' },
] as const;

type Prefs = Record<string, Record<(typeof CHANNELS)[number], boolean>>;

export default function NotificationsMatrix(){
  const [prefs, setPrefs] = React.useState<Prefs>(()=>{
    const base: Prefs = {} as any;
    ROWS.forEach(r => base[r.key] = { Push:true, Email:true, SMS:false });
    return base;
  });
  const [quietHours, setQuietHours] = React.useState<{ start: string; end: string }>({ start: '22:00', end: '07:00' });
  const [tz, setTz] = React.useState('Asia/Kathmandu');
  const [toast, setToast] = React.useState<string | null>(null);
  const [errToast, setErrToast] = React.useState<string | null>(null);
  const [testing, setTesting] = React.useState(false);
  const [confirmReset, setConfirmReset] = React.useState(false);

  const toggle = (row: string, ch: (typeof CHANNELS)[number]) => {
    setPrefs(p => ({ ...p, [row]: { ...p[row], [ch]: !p[row][ch] } }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('ps_token');
      const base = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080';
      // Try backend endpoint first; fall back to localStorage if not available
      const res = await fetch(`${base}/notifications/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ prefs, quietHours, timezone: tz })
      });
      if (!res.ok) throw new Error(String(res.status));
      setToast('Notification preferences saved');
      setTimeout(()=>setToast(null), 2000);
    } catch {
      try {
        localStorage.setItem('ps_notify_prefs', JSON.stringify({ prefs, quietHours, tz }));
        setToast('Saved locally'); setTimeout(()=>setToast(null), 2000);
      } catch (e: any) {
        setErrToast(e?.message || 'Failed to save'); setTimeout(()=>setErrToast(null), 2500);
      }
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      // Simulate sending a test notification
      await new Promise(r => setTimeout(r, 800));
      setToast('Test notification sent');
      setTimeout(()=>setToast(null), 2000);
    } catch (e: any) {
      setErrToast(e?.message || 'Failed to send test');
      setTimeout(()=>setErrToast(null), 2500);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc' }}>
      <HeroBand height={220} />
      <div style={{ padding: theme.spacing.lg }}>
      {toast && (
        <div style={{ position:'fixed', top:16, left:0, right:0, display:'flex', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background: 'rgba(16,185,129,0.15)', color: '#A7F3D0', border: '1px solid rgba(16,185,129,0.3)', padding: '8px 14px', borderRadius: 9999 }}>{toast}</div>
        </div>
      )}
      {errToast && (
        <div style={{ position:'fixed', top:16, left:0, right:0, display:'flex', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background: 'rgba(239,68,68,0.15)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.3)', padding: '8px 14px', borderRadius: 9999 }}>{errToast}</div>
        </div>
      )}
      <div style={{ maxWidth: 960, margin:'-140px auto 0 auto' }}>
        <Card style={{ padding: theme.spacing.xl, marginBottom: theme.spacing.lg, background:'#ffffff', border:'1px solid #e5e7eb', color:'#0f172a' }}>
          <h1 style={{ marginTop:0, color:'#0f172a' }}>Notifications</h1>
          <p className="text-muted">Choose how you want to be notified for each event type. Configure quiet hours and timezone for digests.</p>

          <div style={{ overflowX:'auto', border:'1px solid #e5e7eb', borderRadius:12, background:'#ffffff' }}>
            <table role="grid" style={{ width:'100%', borderCollapse:'separate', borderSpacing:0 }}>
              <thead style={{ background:'#f8fafc', color:'#0f172a' }}>
                <tr>
                  <th style={{ textAlign:'left', padding:12 }}>Event</th>
                  {CHANNELS.map(ch => <th key={ch as string} style={{ textAlign:'left', padding:12 }}>{ch}</th>)}
                </tr>
              </thead>
              <tbody>
                {ROWS.map(r => (
                  <tr key={r.key} style={{ background:'#ffffff', color:'#0f172a' }}>
                    <td style={{ padding:12, borderTop:'1px solid #e5e7eb' }}>{r.label}</td>
                    {CHANNELS.map(ch => (
                      <td key={ch as string} style={{ padding:12, borderTop:'1px solid #e5e7eb' }}>
                        <label style={{ display:'inline-flex', alignItems:'center', gap:8, color:'#0f172a' }}>
                          <input type="checkbox" checked={prefs[r.key][ch]} onChange={()=>toggle(r.key, ch)} />
                          <span style={{ color:'#475569', fontSize:13 }}>{prefs[r.key][ch] ? 'On' : 'Off'}</span>
                        </label>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display:'grid', gap:12, gridTemplateColumns:'1fr 1fr', marginTop: theme.spacing.lg }}>
            <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:12 }}>
              <strong>Quiet hours</strong>
              <div style={{ display:'flex', gap:8, marginTop:8 }}>
                <label>Start <input type="time" value={quietHours.start} onChange={e=>setQuietHours(q=>({...q, start:e.target.value}))} /></label>
                <label>End <input type="time" value={quietHours.end} onChange={e=>setQuietHours(q=>({...q, end:e.target.value}))} /></label>
              </div>
              <div style={{ color:'#64748b', fontSize:12, marginTop:6 }}>Notifications are muted during quiet hours. Timezone aware.</div>
            </div>
            <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:12 }}>
              <strong>Timezone</strong>
              <div style={{ marginTop:8 }}>
                <select value={tz} onChange={e=>setTz(e.target.value)}>
                  <option value="Asia/Kathmandu">Asia/Kathmandu (NPT)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                </select>
              </div>
              <div style={{ color:'#64748b', fontSize:12, marginTop:6 }}>Used for digest delivery and reminders.</div>
            </div>
          </div>

          <div style={{ display:'flex', gap:8, marginTop: theme.spacing.lg }}>
            <Button onClick={handleSave}>Save</Button>
            <Button variant="outline" onClick={() => setConfirmReset(true)}>Reset to defaults</Button>
            <Button variant="outline" onClick={handleTest} disabled={testing}>{testing ? 'Sending…' : 'Send test'}</Button>
          </div>
        </Card>
      </div>

      {confirmReset && (
        <Modal open onClose={()=>setConfirmReset(false)}>
          <div style={{ padding:16 }}>
            <h3 style={{ marginTop:0 }}>Reset preferences?</h3>
            <p>This will restore defaults for all notification channels.</p>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
              <Button variant="outline" onClick={()=>setConfirmReset(false)}>Cancel</Button>
              <Button onClick={()=>{ const base: Prefs = {} as any; ROWS.forEach(r => base[r.key] = { Push:true, Email:true, SMS:false }); setPrefs(base); setConfirmReset(false); }}>Reset</Button>
            </div>
          </div>
        </Modal>
      )}
      </div>
    </div>
  );
}
