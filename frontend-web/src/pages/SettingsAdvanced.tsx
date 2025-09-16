import React from 'react';
import '@styles/premium-ui.css';
import { Card, Button, Modal } from '@components/ui';
import { theme } from '@styles/theme';

export default function SettingsAdvanced(){
  const [account, setAccount] = React.useState({ displayName: '', language: 'en' });
  const [privacy, setPrivacy] = React.useState({ showLocation: true, showPhone: false });
  const [security, setSecurity] = React.useState({ loginAlerts: true, twoFA: false });
  const [payments, setPayments] = React.useState({ defaultMethod: 'cash' });
  const [integrations, setIntegrations] = React.useState({ google: false, apple: false });
  const [audit, setAudit] = React.useState<{ when: string; what: string }[]>([]);
  const [toast, setToast] = React.useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const save = async () => {
    try {
      const token = localStorage.getItem('ps_token');
      const base = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080';
      const res = await fetch(`${base}/users/me/settings`, {
        method: 'PUT',
        headers: { 'Content-Type':'application/json', 'Authorization': token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ account, privacy, security, payments, integrations })
      });
      if (!res.ok) throw new Error(String(res.status));
      setToast('Settings saved'); setTimeout(()=>setToast(null), 2000);
    } catch {
      localStorage.setItem('ps_settings_adv', JSON.stringify({ account, privacy, security, payments, integrations }));
      setToast('Saved locally'); setTimeout(()=>setToast(null), 2000);
    }
  };

  const connect = (prov: 'google' | 'apple') => {
    setIntegrations(prev => ({ ...prev, [prov]: true }));
    setAudit(a => [{ when: new Date().toISOString(), what: `Connected ${prov} sign-in` }, ...a]);
  };

  return (
    <div style={{ minHeight:'100vh', background: 'linear-gradient(180deg, #e2e8f0 0%, #f8fafc 60%, #e2e8f0 100%)', padding: theme.spacing.lg }}>
      {toast && (
        <div style={{ position:'fixed', top:16, left:0, right:0, display:'flex', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background: 'rgba(16,185,129,0.15)', color: '#A7F3D0', border: '1px solid rgba(16,185,129,0.3)', padding: '8px 14px', borderRadius: 9999 }}>{toast}</div>
        </div>
      )}
      <div style={{ maxWidth: 980, margin:'0 auto' }}>
        <h1 style={{ color:'white' }}>Settings</h1>
        {/* Account */}
        <Card style={{ padding: theme.spacing.xl, marginBottom: theme.spacing.lg, background:'#ffffff', border:'1px solid #e5e7eb', color:'#0f172a' }}>
          <h2>Account</h2>
          <div style={{ display:'grid', gap:12, gridTemplateColumns:'1fr 1fr' }}>
            <label>Display name<input value={account.displayName} onChange={e=>setAccount(p=>({ ...p, displayName:e.target.value }))} /></label>
            <label>Language<select value={account.language} onChange={e=>setAccount(p=>({ ...p, language:e.target.value }))}><option value="en">English</option><option value="ne">नेपाली (Nepali)</option></select></label>
          </div>
        </Card>
        {/* Privacy */}
        <Card style={{ padding: theme.spacing.xl, marginBottom: theme.spacing.lg, background:'#ffffff', border:'1px solid #e5e7eb', color:'#0f172a' }}>
          <h2>Privacy</h2>
          <label><input type="checkbox" checked={privacy.showLocation} onChange={e=>setPrivacy(p=>({ ...p, showLocation:e.target.checked }))}/> Show location</label>
          <br />
          <label><input type="checkbox" checked={privacy.showPhone} onChange={e=>setPrivacy(p=>({ ...p, showPhone:e.target.checked }))}/> Show phone</label>
        </Card>
        {/* Security */}
        <Card style={{ padding: theme.spacing.xl, marginBottom: theme.spacing.lg, background:'#ffffff', border:'1px solid #e5e7eb', color:'#0f172a' }}>
          <h2>Security</h2>
          <label><input type="checkbox" checked={security.loginAlerts} onChange={e=>setSecurity(p=>({ ...p, loginAlerts:e.target.checked }))}/> Login alerts</label>
          <br />
          <label><input type="checkbox" checked={security.twoFA} onChange={e=>setSecurity(p=>({ ...p, twoFA:e.target.checked }))}/> Two‑factor authentication</label>
          <div style={{ marginTop:12 }}>
            <Button variant="outline" onClick={()=>setConfirmDelete(true)}>Delete account…</Button>
          </div>
        </Card>
        {/* Payments */}
        <Card style={{ padding: theme.spacing.xl, marginBottom: theme.spacing.lg, background:'#ffffff', border:'1px solid #e5e7eb', color:'#0f172a' }}>
          <h2>Payments</h2>
          <label>Default method
            <select value={payments.defaultMethod} onChange={e=>setPayments(p=>({ ...p, defaultMethod:e.target.value }))}>
              <option value="cash">Cash</option>
              <option value="esewa">eSewa</option>
              <option value="khalti">Khalti</option>
            </select>
          </label>
        </Card>
        {/* Integrations */}
        <Card style={{ padding: theme.spacing.xl, marginBottom: theme.spacing.lg, background:'#ffffff', border:'1px solid #e5e7eb', color:'#0f172a' }}>
          <h2>Integrations</h2>
          <div style={{ display:'flex', gap:8 }}>
            <Button variant="outline" onClick={()=>connect('google')} disabled={integrations.google}>{integrations.google ? 'Google linked' : 'Link Google'}</Button>
            <Button variant="outline" onClick={()=>connect('apple')} disabled={integrations.apple}>{integrations.apple ? 'Apple linked' : 'Link Apple'}</Button>
          </div>
        </Card>
        {/* Audit trail */}
        <Card style={{ padding: theme.spacing.xl, marginBottom: theme.spacing.lg }}>
          <h2>Audit trail</h2>
          {audit.length === 0 ? (
            <div style={{ color:'#64748b' }}>No recent changes.</div>
          ) : (
            <ul>
              {audit.map((a, i) => (<li key={i}>{a.when}: {a.what}</li>))}
            </ul>
          )}
        </Card>
        <div style={{ display:'flex', gap:8 }}>
          <Button onClick={save}>Save settings</Button>
        </div>
      </div>

      {confirmDelete && (
        <Modal open onClose={()=>setConfirmDelete(false)}>
          <div style={{ padding:16 }}>
            <h3 style={{ marginTop:0 }}>Delete account?</h3>
            <p>This is permanent and cannot be undone.</p>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
              <Button variant="outline" onClick={()=>setConfirmDelete(false)}>Cancel</Button>
              <Button onClick={()=>{ setConfirmDelete(false); alert('Account deletion flow placeholder'); }}>Delete</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
