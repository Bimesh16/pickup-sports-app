import React from 'react';
import { TabBar } from '@components/premium-tabs/TabBar';
import type { TabKey } from '@components/premium-tabs/TabTypes';

const ITEMS = [
  { key: 'games', label: 'Games', icon: '⚽' },
  { key: 'venues', label: 'Venues', icon: '🏟️' },
  { key: 'profile', label: 'Profile', icon: '👤' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
  { key: 'notifications', label: 'Notifications', icon: '🔔' },
] as const;

function useQueryTab(defaultKey: TabKey){
  const [key, setKey] = React.useState<TabKey>(() => {
    const p = new URLSearchParams(window.location.search);
    const t = (p.get('tab') || '').toLowerCase();
    const allowed: TabKey[] = ['games','venues','profile','settings','notifications'];
    return (allowed.includes(t as TabKey) ? (t as TabKey) : defaultKey);
  });
  React.useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    p.set('tab', key);
    const url = `${window.location.pathname}?${p.toString()}`;
    window.history.pushState({}, '', url);
  }, [key]);
  return [key, setKey] as const;
}

export default function PremiumTabsDemo(){
  const [active, setActive] = useQueryTab('games');
  const [unread, setUnread] = React.useState(7);
  const [profileCompletion, setProfileCompletion] = React.useState(80);
  const [offline, setOffline] = React.useState(false);

  // prefetch next tab content (mock)
  React.useEffect(() => {
    const id = window.requestIdleCallback ? window.requestIdleCallback(() => {/* pretend to prefetch */}) : window.setTimeout(() => {}, 0);
    return () => { if (typeof id === 'number') clearTimeout(id as number); };
  }, [active]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0b1220, #1f2937)' }}>
      <TabBar
        items={ITEMS as any}
        activeKey={active}
        onChange={(k) => setActive(k)}
        unreadCount={unread}
        profileCompletion={profileCompletion}
        offline={offline}
      />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: 16, color: 'white' }}>
        <Controls offline={offline} setOffline={setOffline} unread={unread} setUnread={setUnread} prof={profileCompletion} setProf={setProfileCompletion} />
        <Panel key={active} tab={active} />
      </div>
    </div>
  );
}

function Controls({ offline, setOffline, unread, setUnread, prof, setProf }: any){
  return (
    <div style={{ display:'flex', gap:12, alignItems:'center', margin:'12px 0 16px 0' }}>
      <label><input type="checkbox" checked={offline} onChange={e=>setOffline(e.target.checked)} /> Offline</label>
      <label>Unread <input type="number" min={0} max={999} value={unread} onChange={e=>setUnread(parseInt(e.target.value||'0',10))} style={{ width: 64 }} /></label>
      <label>Profile % <input type="number" min={0} max={100} value={prof} onChange={e=>setProf(parseInt(e.target.value||'0',10))} style={{ width: 64 }} /></label>
    </div>
  );
}

function Panel({ tab }: { tab: TabKey }){
  const common = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16 } as React.CSSProperties;
  if (tab === 'games') return <div role="tabpanel" id="panel-games" aria-labelledby="tab-games" style={common}><h2>Games</h2><Skeleton rows={8} /></div>;
  if (tab === 'venues') return <div role="tabpanel" id="panel-venues" aria-labelledby="tab-venues" style={common}><h2>Venues</h2><CardGrid /></div>;
  if (tab === 'profile') return <div role="tabpanel" id="panel-profile" aria-labelledby="tab-profile" style={common}><h2>Profile</h2><ProfilePlaceholder /></div>;
  if (tab === 'settings') return <div role="tabpanel" id="panel-settings" aria-labelledby="tab-settings" style={common}><h2>Settings</h2><SettingsPlaceholder /></div>;
  return <div role="tabpanel" id="panel-notifications" aria-labelledby="tab-notifications" style={common}><h2>Notifications</h2><Skeleton rows={5} /></div>;
}

function Skeleton({ rows = 6 }: { rows?: number }){
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ height: 18, borderRadius: 8, background: 'linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.16), rgba(255,255,255,0.08))', backgroundSize: '200% 100%', animation: 'pt-shimmer 1.2s linear infinite', marginBottom: 12 }} />
      ))}
      <style>{`@keyframes pt-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}

function CardGrid(){
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap: 12 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ height: 120, borderRadius: 8, background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ height: 14, width: '60%', marginTop: 8, borderRadius: 6, background: 'rgba(255,255,255,0.12)' }} />
          <div style={{ height: 12, width: '40%', marginTop: 6, borderRadius: 6, background: 'rgba(255,255,255,0.10)' }} />
        </div>
      ))}
    </div>
  );
}

function ProfilePlaceholder(){
  return (
    <div style={{ display:'grid', gap: 12 }}>
      <div style={{ display:'flex', gap:12, alignItems:'center' }}>
        <div style={{ width:64, height:64, borderRadius:999, background:'rgba(255,255,255,0.12)' }} />
        <div style={{ flex:1 }}>
          <div style={{ height:14, width:'30%', background:'rgba(255,255,255,0.12)', borderRadius:6, marginBottom:6 }} />
          <div style={{ height:12, width:'50%', background:'rgba(255,255,255,0.10)', borderRadius:6 }} />
        </div>
      </div>
      <div style={{ height:10, borderRadius:6, background:'rgba(16,185,129,0.35)', width:'70%' }} />
    </div>
  );
}

function SettingsPlaceholder(){
  return (
    <div style={{ display:'grid', gap: 10 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', borderRadius: 12, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <div style={{ height:14, width:120, background:'rgba(255,255,255,0.12)', borderRadius:6, marginBottom:6 }} />
            <div style={{ height:12, width:200, background:'rgba(255,255,255,0.10)', borderRadius:6 }} />
          </div>
          <div style={{ width:44, height:24, borderRadius:999, background:'rgba(255,255,255,0.12)' }} />
        </div>
      ))}
    </div>
  );
}

