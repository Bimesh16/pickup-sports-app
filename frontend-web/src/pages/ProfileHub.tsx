import React from 'react';
import '@styles/premium-ui.css';
import { PlayerCard } from '@components/profile/PlayerCard';
import { CompletionMeter } from '@components/profile/CompletionMeter';
import { BadgeGrid } from '@components/profile/BadgeGrid';
import { ActivityList } from '@components/profile/ActivityList';
import { SessionList } from '@components/profile/SessionList';
import { InlineEdit } from '@components/profile/InlineEdit';
import { useAuth } from '@hooks/useAuth';
import { Card, Button, Modal } from '@components/ui';
import { theme } from '@styles/theme';

export default function ProfileHub(){
  const { user } = useAuth();
  const [active, setActive] = React.useState<'overview'|'activity'|'stats'|'badges'|'teams'|'sports'|'security'>(() => {
    const p = new URLSearchParams(window.location.search); const t = (p.get('section') || p.get('p') || 'overview').toLowerCase();
    const allowed = ['overview','activity','stats','badges','teams','sports','security'];
    return (allowed.includes(t) ? (t as any) : 'overview');
  });
  React.useEffect(()=>{
    const p = new URLSearchParams(window.location.search); p.set('section', active); window.history.replaceState({},'',`${window.location.pathname}?${p.toString()}`);
  },[active]);

  // Keyboard navigation for sub-tabs (ARIA Tabs pattern)
  const tabsRef = React.useRef<HTMLDivElement>(null);
  const handleTabsKey = (e: React.KeyboardEvent) => {
    const order: any[] = ['overview','activity','stats','badges','teams','sports','security'];
    let idx = order.indexOf(active);
    if (e.key === 'ArrowRight') { idx = (idx+1)%order.length; setActive(order[idx] as any); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { idx = (idx-1+order.length)%order.length; setActive(order[idx] as any); e.preventDefault(); }
    if (e.key === 'Home') { setActive(order[0] as any); e.preventDefault(); }
    if (e.key === 'End') { setActive(order[order.length-1] as any); e.preventDefault(); }
  };

  const [bio, setBio] = React.useState(user?.bio || '');
  const originalBioRef = React.useRef<string>(user?.bio || '');
  const dirty = bio !== (originalBioRef.current || '');
  const [toast, setToast] = React.useState<string | null>(null);
  const [errToast, setErrToast] = React.useState<string | null>(null);
  const [confirm, setConfirm] = React.useState<null | { target: typeof active }>(null);
  const [panelLoading, setPanelLoading] = React.useState(false);
  const [sessions, setSessions] = React.useState<any[] | null>(null);
  const [mfa, setMfa] = React.useState<{ secret?: string; otpauth?: string } | null>(null);
  const [mfaCode, setMfaCode] = React.useState('');
  const [stats, setStats] = React.useState<{ sportCounts: Record<string, number>; weekdayTime?: number[][] } | null>(null);
  const [showInvite, setShowInvite] = React.useState(false);
  const [availability, setAvailability] = React.useState<boolean>(() => localStorage.getItem('ps_avail') !== '0');
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [streakWeeks, setStreakWeeks] = React.useState<number>(3);
  const [attSeries, setAttSeries] = React.useState<number[]>(() => Array.from({ length: 12 }, (_, i) => Math.max(0, Math.round(3 + 2*Math.sin(i/2) + (Math.random()*2-1)))));

  // Global ⌘K / Ctrl+K to open palette
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isCmdK = (e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === 'k');
      if (isCmdK) { e.preventDefault(); setPaletteOpen(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  React.useEffect(() => {
    if (active !== 'badges') return;
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('ps_confetti_fired') === '1') return;
    try { triggerConfetti(); if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('ps_confetti_fired','1'); } catch {}
  }, [active]);
  React.useEffect(() => {
    // Load user stats from backend
    (async () => {
      try {
        const token = localStorage.getItem('ps_token');
        const base = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080';
        const res = await fetch(`${base}/stats/users/me`, { headers: { 'Authorization': token ? `Bearer ${token}` : '' } });
        if (res.ok) {
          const data = await res.json();
          setStats({ sportCounts: data?.sportCounts || {}, weekdayTime: data?.weekdayTime });
          if (Array.isArray(data?.recentWeeklyAttendance) && data.recentWeeklyAttendance.length) {
            setAttSeries(data.recentWeeklyAttendance);
          }
        }
      } catch {}
    })();
  }, []);
  const completion = React.useMemo(()=>{
    let pct = 40; const nudges: string[] = [];
    if (!user?.avatarUrl) nudges.push('Add a photo (+10%)'); else pct += 10;
    if (!(user as any)?.isVerified) nudges.push('Verify email (+5%)'); else pct += 5;
    if (!bio) nudges.push('Add a short bio (+5%)'); else pct += 5;
    return { pct: Math.min(100, pct), nudges };
  }, [user?.avatarUrl, (user as any)?.isVerified, bio]);

  return (
    <div className="app-shell">
      
      <div className="app-shell__inner">
        <section className="profile-hero"></section>
        <main className="profile-content safe-bottom">
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
        <div style={{ marginBottom: theme.spacing.lg }}>
          <PlayerCard
            avatarUrl={user?.avatarUrl}
            displayName={`${user?.firstName||''} ${user?.lastName||''}`.trim() || (user?.username||'')}
            username={user?.username || ''}
            level={(user?.skillLevel as any) || 'BEGINNER'}
            jerseyNumber={(user as any)?.jerseyNumber}
            city={(user as any)?.location || undefined}
            onEdit={()=>{/* open edit drawer later */}}
            onShare={()=>{ try { navigator.share?.({ title:'My profile', url: window.location.href }); } catch {} }}
            onShowQr={()=>setShowInvite(true)}
            onCopyInvite={()=>{ navigator.clipboard?.writeText(inviteLink(user?.username)); setToast('Invite link copied'); setTimeout(()=>setToast(null), 2000); }}
          />
          <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', position:'relative', zIndex:1 }}>
            <label style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#ffffff', border:'1px solid #e5e7eb', padding:'6px 10px', borderRadius:12 }}>
              <input type="checkbox" checked={availability} onChange={async (e)=>{ const v=e.target.checked; setAvailability(v); try{ localStorage.setItem('ps_avail', v?'1':'0'); }catch{} setToast(v?'Available':'Unavailable'); setTimeout(()=>setToast(null),1500); try{ await persistAvailability(v); }catch{} }} />
              <span className="text-strong">Availability</span>
            </label>
            <Button variant="outline" onClick={()=>setPaletteOpen(true)}>⌘K Command Palette</Button>
          </div>
        </div>
        <div style={{ marginBottom: theme.spacing.lg, position:'relative', zIndex:1 }}>
          <CompletionMeter percent={completion.pct} nudges={completion.nudges} />
          {/* Privacy preview */}
          <div style={{ marginTop: 8, background:'#ffffff', border:'1px solid #e5e7eb', borderRadius:12, padding:12, color:'#0f172a' }}>
            <div style={{ fontWeight:700, marginBottom:6 }}>Privacy preview</div>
            <div className="text-muted" style={{ fontSize: 13, color:'#475569' }}>Visible to others: avatar, display name, @tag, level, preferred sport. Hidden: email, phone.</div>
          </div>
        </div>
        <Card style={{ padding: theme.spacing.xl, background:'#ffffff', border:'1px solid #e5e7eb' }}>
          <div ref={tabsRef} onKeyDown={handleTabsKey} role="tablist" aria-label="Profile sections" style={{ position:'sticky', top: 12, zIndex: 10, background:'#ffffff', display:'flex', gap:8, flexWrap:'wrap', marginBottom:16, paddingBottom:8 }}>
            {(['overview','activity','stats','badges','teams','sports','security'] as const).map(k => (
              <button
                key={k}
                role="tab"
                aria-selected={active===k}
                className="btn-outline"
                onClick={() => {
                  if (dirty) { setConfirm({ target: k }); return; }
                  setPanelLoading(true); setActive(k); setTimeout(()=>setPanelLoading(false), 300);
                }}
              >{k[0].toUpperCase()+k.slice(1)}</button>
          ))}
          </div>
          {active==='overview' && (
            <div>
              <h2>Overview</h2>
              <InlineEdit label="Bio" value={bio} onChange={setBio} placeholder="Write a short bio" onSave={async ()=>{
                try {
                  const token = localStorage.getItem('ps_token');
                  const base = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080';
                  const res = await fetch(`${base}/profiles/me`, { headers: { 'Authorization': token ? `Bearer ${token}` : '' } });
                  const etag = res.headers.get('etag') || undefined;
                  const up = await fetch(`${base}/profiles/me`, { method:'PUT', headers: { 'Content-Type':'application/json', ...(etag?{ 'If-Match': etag }:{}), 'Authorization': token ? `Bearer ${token}` : '' }, body: JSON.stringify({ bio }) });
                  if (!up.ok) throw new Error(await up.text());
                  originalBioRef.current = bio;
                  setToast('Saved'); setTimeout(()=>setToast(null), 2000);
                } catch (e:any) { setErrToast(e?.message || 'Failed to save'); setTimeout(()=>setErrToast(null), 2500); }
              }} />
              <div style={{ height:12 }} />
              <div style={{ display:'grid', gap:12, gridTemplateColumns:'1fr 1fr' }}>
                <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:12, background:'#fff' }}>
                  {panelLoading ? <Skeleton rows={6} /> : (
                    <>
                      <div style={{ fontWeight:600, marginBottom:6 }}>Next match</div>
                      <div className="text-muted" style={{ fontSize:13 }}>No RSVP yet. Find a game and RSVP to see it here.</div>
                    </>
                  )}
                </div>
                <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:12, background:'#fff' }}>
                  {panelLoading ? <Skeleton rows={4} /> : (
                    <>
                      <div style={{ fontWeight:600, marginBottom:6 }}>Highlights</div>
                      <ul className="text-muted" style={{ margin:0, paddingLeft:18 }}>
                        <li>Fair play score: 4.8</li>
                        <li>Streak: 3 games</li>
                        <li>Most played: {(stats?.sportCounts && Object.keys(stats.sportCounts)[0]) || 'Futsal'}</li>
                      </ul>
                    </>
                  )}
                </div>
              </div>
              {/* Top Matches for You (mock scoring from Sports Profile) */}
              <div style={{ marginTop:12, border:'1px solid #e5e7eb', borderRadius:12, padding:12, background:'#fff' }}>
                <div style={{ fontWeight:600, marginBottom:6 }}>Top Matches for You</div>
                <MatchesForYou />
              </div>
              {/* Streak banner */}
              <div style={{ marginTop:12, background:'linear-gradient(90deg, rgba(0,56,147,0.12), rgba(220,20,60,0.12))', border:'1px solid #e5e7eb', borderRadius:12, padding:'10px 12px', display:'flex', alignItems:'center', gap:8 }}>
                <span>🔥</span>
                <div style={{ fontWeight:700, color:'#0f172a' }}>{streakWeeks}-week streak</div>
                <div className="text-muted" style={{ fontSize:13 }}>&nbsp;Keep it up! Don’t break the chain.</div>
              </div>
            </div>
          )}
          {active==='activity' && (
            <ActivitySectionAdvanced />
          )}
          {active==='stats' && (
            <div>
              <h2>Stats</h2>
              <div style={{ display:'grid', gap:12, gridTemplateColumns:'1fr 1fr' }}>
                <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:12, background:'#fff' }}>
                  {panelLoading ? <Skeleton rows={10} /> : <>
                    <PerSportChart data={stats?.sportCounts || {}} />
                    <div style={{ height:8 }} />
                    <AttendanceLine series={attSeries} />
                  </>}
                  <div style={{ marginTop: 8, display:'flex', gap: 8, flexWrap:'wrap' }}>
                    <KpiTrend label="Games played" value={Object.values(stats?.sportCounts || {}).reduce((a,b)=>a+b,0)} prev={sumCounts((stats as any)?.prevSportCounts)} />
                    <Kpi label="Streak" value={streakWeeks} />
                    <Kpi label="Fair play" value={'4.8'} />
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Button variant="outline" onClick={()=>shareRecap()}>Share season recap</Button>
                    <Button variant="outline" onClick={()=>downloadPlayerCard(user, stats)}>Download Player Card</Button>
                  </div>
                </div>
                <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:12, background:'#fff' }}>
                  {panelLoading ? <Skeleton rows={10} /> : <WeekTimeHeatmap counts={stats?.weekdayTime || Array.from({ length: 7 }, () => Array.from({ length: 6 }, () => Math.floor(Math.random()*5)))} />}
                </div>
              </div>
            </div>
          )}
          {active==='badges' && (
            <div>
              <h2>Badges</h2>
              {panelLoading ? <Skeleton rows={8} /> : <BadgeGrid badges={[
                { id:'organizer', name:'Organizer', icon:'📋', earned:true },
                { id:'fair', name:'Fair Play', icon:'🤝', earned:false, tip:'Finish 5 games with no reports' },
                { id:'mvp', name:'MVP', icon:'⭐', earned:false, tip:'Earn 10 rating 5.0' },
                { id:'iron', name:'Iron Man', icon:'💪', earned:false, tip:'Play 30 days in a row' },
              ]} />}
              <div id="confetti-root" />
              <div style={{ marginTop:8 }}>
                <Button variant="outline" onClick={()=>triggerConfetti()}>Celebrate</Button>
              </div>
            </div>
          )}
          {active==='teams' && (
            <div>
              <h2>Teams</h2>
              <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:12, background:'#fff' }}>
                {panelLoading ? <Skeleton rows={6} /> : (
                  <>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                      <strong>Rosters</strong>
                      <Button variant="outline" onClick={()=>setShowInvite(true)}>Invite via QR</Button>
                    </div>
                    <ul style={{ margin:0, paddingLeft:18 }}>
                      <li>Bikash (Captain)</li>
                      <li>Arun (Player)</li>
                      <li>Rina (Player)</li>
                    </ul>
                  </>
                )}
              </div>
            </div>
          )}
          {active==='sports' && (
            <SportsProfileSection />
          )}
          {active==='security' && (
            <div>
              <h2>Security</h2>
              {/* 2FA Setup */}
              <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:12, background:'#fff', marginBottom:12 }}>
                <strong>Two‑Factor Authentication (TOTP)</strong>
                <div style={{ marginTop:8, display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
                  <Button variant="outline" onClick={async ()=>{
                    try {
                      const token = localStorage.getItem('ps_token');
                      const base = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080';
                      const res = await fetch(`${base}/auth/mfa/enroll`, { method:'POST', headers: { 'Authorization': token ? `Bearer ${token}` : '' } });
                      const data = await res.json();
                      setMfa({ secret: data.secret, otpauth: data.otpauth });
                    } catch {}
                  }}>Enroll</Button>
                  <Button variant="outline" onClick={async ()=>{
                    try {
                      const token = localStorage.getItem('ps_token');
                      const base = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080';
                      await fetch(`${base}/auth/mfa/disable`, { method:'POST', headers: { 'Authorization': token ? `Bearer ${token}` : '' } });
                      setMfa(null); setMfaCode(''); setToast('2FA disabled'); setTimeout(()=>setToast(null), 2000);
                    } catch {}
                  }}>Disable</Button>
                  {mfa?.otpauth && (
                    <div style={{ fontSize:12, color:'#475569' }}>Scan in Google Authenticator: <code>{mfa.otpauth}</code></div>
                  )}
                </div>
                {mfa?.otpauth && (
                  <div style={{ marginTop:8, display:'flex', gap:8, alignItems:'center' }}>
                    <input placeholder="Enter 6‑digit code" value={mfaCode} onChange={e=>setMfaCode(e.target.value)} style={{ padding:'6px 10px', border:'1px solid #cbd5e1', borderRadius:8 }} />
                    <Button onClick={async ()=>{
                      try {
                        const token = localStorage.getItem('ps_token');
                        const base = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080';
                        const up = await fetch(`${base}/auth/mfa/enable`, { method:'POST', headers: { 'Content-Type':'application/json', 'Authorization': token ? `Bearer ${token}` : '' }, body: JSON.stringify({ code: mfaCode }) });
                        if (!up.ok) throw new Error(await up.text());
                        setToast('2FA enabled'); setTimeout(()=>setToast(null), 2000);
                      } catch(e:any){ setErrToast(e?.message || 'Failed to enable'); setTimeout(()=>setErrToast(null), 2500); }
                    }}>Verify & Enable</Button>
                  </div>
                )}
              </div>
              {/* Sessions */}
              {panelLoading ? <Skeleton rows={5} /> : (
                <div>
                  <div style={{ marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <strong>Active Sessions</strong>
                    <Button variant="outline" onClick={async ()=>{
                      try {
                        const token = localStorage.getItem('ps_token');
                        const base = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080';
                        const res = await fetch(`${base}/auth/sessions`, { headers: { 'Authorization': token ? `Bearer ${token}` : '' } });
                        const items = await res.json();
                        setSessions(items);
                      } catch {}
                    }}>Refresh</Button>
                  </div>
                  <SessionList sessions={(sessions||[]).map((s:any)=>({ id:String(s.id), device: s.userAgent || s.deviceId || 'Device', ip: s.issuedIp || '—', lastActive: s.lastUsedAt || s.createdAt }))} onRevoke={async (id)=>{
                    try {
                      const token = localStorage.getItem('ps_token');
                      const base = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080';
                      await fetch(`${base}/auth/sessions/${id}`, { method:'DELETE', headers: { 'Authorization': token ? `Bearer ${token}` : '' } });
                      setSessions((prev:any)=> (prev||[]).filter((x:any)=> String(x.id)!==String(id)) );
                    } catch {}
                  }} />
                </div>
              )}
            </div>
          )}
        </Card>
        {confirm && (
          <Modal isOpen onClose={()=>setConfirm(null)}>
            <div style={{ padding: 16 }}>
              <h3 style={{ marginTop: 0 }}>Unsaved changes</h3>
              <p>You have unsaved changes. What would you like to do?</p>
              <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                <Button variant="outline" onClick={()=>setConfirm(null)}>Cancel</Button>
                <Button variant="outline" onClick={()=>{ setBio(originalBioRef.current || ''); setConfirm(null); setPanelLoading(true); setActive(confirm.target); setTimeout(()=>setPanelLoading(false), 300); }}>Discard</Button>
                <Button onClick={async ()=>{
                  try {
                    const token = localStorage.getItem('ps_token');
                    const base = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080';
                    const res = await fetch(`${base}/profiles/me`, { headers: { 'Authorization': token ? `Bearer ${token}` : '' } });
                    const etag = res.headers.get('etag') || undefined;
                    const up = await fetch(`${base}/profiles/me`, { method:'PUT', headers: { 'Content-Type':'application/json', ...(etag?{ 'If-Match': etag }:{}), 'Authorization': token ? `Bearer ${token}` : '' }, body: JSON.stringify({ bio }) });
                    if (!up.ok) throw new Error(await up.text());
                    originalBioRef.current = bio; setToast('Saved'); setTimeout(()=>setToast(null), 2000);
                    const target = confirm.target; setConfirm(null); setPanelLoading(true); setActive(target); setTimeout(()=>setPanelLoading(false), 300);
                  } catch(e:any){ setErrToast(e?.message || 'Failed to save'); setTimeout(()=>setErrToast(null), 2500); }
                }}>Save and continue</Button>
              </div>
            </div>
          </Modal>
        )}
        {showInvite && (
        <Modal isOpen onClose={()=>setShowInvite(false)}>
          <div style={{ padding:16 }}>
            <h3 style={{ marginTop:0 }}>Invite via link</h3>
            <p>Share this link to let others view your profile or add you in person.</p>
            <div style={{ display:'grid', gap:8 }}>
              <code style={{ background:'#f1f5f9', padding:'6px 8px', borderRadius:8 }}>{inviteLink(user?.username)}</code>
              <div style={{ display:'grid', placeItems:'center' }}>
                <img
                  alt="Invite QR"
                  style={{ width: 180, height: 180, borderRadius:12, border:'1px solid #e5e7eb', background:'#fff' }}
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(inviteLink(user?.username))}`}
                />
              </div>
              <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                <Button variant="outline" onClick={()=>setShowInvite(false)}>Close</Button>
                <Button onClick={()=>{ navigator.clipboard?.writeText(inviteLink(user?.username)); setToast('Invite link copied'); setTimeout(()=>setToast(null), 2000); }}>Copy link</Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
      {paletteOpen && (
        <Modal isOpen onClose={()=>setPaletteOpen(false)}>
          <div style={{ padding: 12 }}>
            <h3 style={{ marginTop:0 }}>Command Palette</h3>
            <div style={{ display:'grid', gap: 8 }}>
              {(['overview','activity','stats','badges','teams','security'] as const).map(k => (
                <Button key={k} variant="outline" onClick={()=>{ setActive(k); setPaletteOpen(false); }}>{k[0].toUpperCase()+k.slice(1)}</Button>
              ))}
              <Button variant="outline" onClick={()=>{ setShowInvite(true); setPaletteOpen(false); }}>Invite via QR</Button>
              <Button variant="outline" onClick={()=>{ const v=!availability; setAvailability(v); try{ localStorage.setItem('ps_avail', v?'1':'0'); }catch{}; setPaletteOpen(false); }}>Toggle availability</Button>
              <Button variant="outline" onClick={()=>{ navigator.clipboard?.writeText(window.location.href); setToast('Link copied'); setTimeout(()=>setToast(null),2000); setPaletteOpen(false); }}>Copy profile link</Button>
            </div>
          </div>
        </Modal>
      )}
        </main>
      </div>
    </div>
  );
}

function Skeleton({ rows = 6 }: { rows?: number }){
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ height: 14, borderRadius: 8, background: 'linear-gradient(90deg, rgba(0,0,0,0.06), rgba(0,0,0,0.12), rgba(0,0,0,0.06))', backgroundSize: '200% 100%', animation: 'ph-shimmer 1.1s linear infinite', marginBottom: 10 }} />
      ))}
      <style>{`@keyframes ph-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}

function inviteLink(username?: string | null){
  const origin = window.location.origin;
  const u = username || 'player';
  return `${origin}/register?ref=${encodeURIComponent(u)}`;
}

function ActivitySectionAdvanced(){
  const [filter, setFilter] = React.useState<'all'|'joins'|'rsvps'|'ratings'|'badges'>('all');
  const [page, setPage] = React.useState(0);
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);

  const load = async (nextPage: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('ps_token');
      const base = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080';
      const res = await fetch(`${base}/notifications?page=${nextPage}&size=10`, { headers: { 'Authorization': token ? `Bearer ${token}` : '' } });
      if (res.status === 304) { setHasMore(false); return; }
      const data = await res.json();
      // data is Spring Page; content array
      const content = data?.content || [];
      setItems(prev => [...prev, ...content.map((n:any)=>({ id: n.id, type: inferType(n), text: n.message || n.title || 'Update', at: n.createdAt }))]);
      setHasMore(!data?.last);
      setPage(nextPage);
    } catch {
      // fallback mock
      const mock = Array.from({ length: 5 }).map((_,i)=>({ id:`m${page}-${i}`, type:'joins', text:'Joined a game', at: new Date().toISOString() }));
      setItems(prev => [...prev, ...mock]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(()=>{ setItems([]); setPage(0); setHasMore(true); load(0); }, [filter]);

  const filtered = items.filter(it => filter==='all' || it.type === filter);

  return (
    <div>
      <h2>Activity</h2>
      <div style={{ display:'flex', gap:8, marginBottom:8 }}>
        {(['all','joins','rsvps','ratings','badges'] as const).map(k => (
          <button key={k} className="btn-outline" aria-pressed={filter===k} onClick={()=>setFilter(k)}>{k.toUpperCase()}</button>
        ))}
      </div>
      {loading && items.length===0 ? <Skeleton rows={8} /> : <ActivityList items={filtered} />}
      <div style={{ marginTop:8 }}>
        <button className="btn-outline" onClick={()=>load(page+1)} disabled={!hasMore || loading}>{hasMore ? (loading ? 'Loading…' : 'Load more') : 'No more activity'}</button>
      </div>
    </div>
  );
}

function inferType(n:any): 'joins'|'rsvps'|'ratings'|'badges' {
  const s = ((n.type || n.title || n.message || '')+'').toLowerCase();
  if (s.includes('join')) return 'joins';
  if (s.includes('rsvp')) return 'rsvps';
  if (s.includes('rating')) return 'ratings';
  if (s.includes('badge')) return 'badges';
  return 'joins';
}

function PerSportChart({ data }: { data: Record<string, number> }){
  const labels = Object.keys(data);
  const max = Math.max(1, ...Object.values(data));
  const width = 320, height = 160, padding = 24;
  const barW = (width - padding*2) / labels.length - 8;
  return (
    <div>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Appearances by sport</div>
      <svg width={width} height={height} role="img" aria-label="Per-sport appearances">
        {labels.map((label, i) => {
          const value = data[label];
          const h = ((height - padding*2) * value) / max;
          const x = padding + i * ((width - padding*2) / labels.length) + 4;
          const y = height - padding - h;
          return (
            <g key={label}>
              <rect x={x} y={y} width={barW} height={h} fill="#dc143c" rx={6} />
              <text x={x + barW/2} y={height - 6} textAnchor="middle" fontSize="10" fill="#475569">{label}</text>
              <text x={x + barW/2} y={y - 4} textAnchor="middle" fontSize="10" fill="#0f172a">{value}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function WeekTimeHeatmap({ counts }: { counts: number[][] }){
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const slots = ['6-9','9-12','12-15','15-18','18-21','21-24'];
  const cols = slots.length, rows = days.length;
  const cell = 18, gap = 4, padding = 24;
  const width = padding*2 + cols*cell + (cols-1)*gap;
  const height = padding*2 + rows*cell + (rows-1)*gap + 14;
  const max = Math.max(1, ...counts.flat());
  const color = (v:number) => `rgba(220,20,60,${0.15 + 0.7*(v/max)})`;
  return (
    <div>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Heatmap by weekday/time</div>
      <svg width={width} height={height} role="img" aria-label="Heatmap by weekday and time">
        {days.map((d, r) => (
          <text key={d} x={0} y={padding + r*(cell+gap) + cell - 4} fontSize="10" fill="#475569">{d}</text>
        ))}
        {slots.map((s, c) => (
          <text key={s} x={padding + c*(cell+gap) + 2} y={12} fontSize="10" fill="#475569">{s}</text>
        ))}
        {counts.map((row, r) => row.map((v, c) => (
          <rect key={`${r}-${c}`} x={padding + c*(cell+gap)} y={padding + r*(cell+gap)} width={cell} height={cell} rx={4} fill={color(v)} />
        )))}
      </svg>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number | string }){
  return (
    <div style={{ background:'#ffffff', border:'1px solid #e5e7eb', borderRadius:12, padding:'8px 10px', minWidth: 110 }}>
      <div style={{ color:'#64748b', fontSize:12 }}>{label}</div>
      <div style={{ fontWeight:700, color:'#0f172a' }}>{value}</div>
    </div>
  );
}

function shareRecap(){
  try {
    const text = 'My season recap on Pickup Sports!';
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: 'Season Recap', text, url });
    else navigator.clipboard?.writeText(url);
  } catch {}
}

function KpiTrend({ label, value, prev }: { label: string; value: number; prev?: number }){
  const delta = prev != null ? (value - prev) : 0;
  const up = delta > 0;
  const down = delta < 0;
  return (
    <div style={{ background:'#ffffff', border:'1px solid #e5e7eb', borderRadius:12, padding:'8px 10px', minWidth: 140 }}>
      <div style={{ color:'#64748b', fontSize:12 }}>{label}</div>
      <div style={{ fontWeight:700, color:'#0f172a', display:'flex', alignItems:'center', gap:6 }}>
        <span>{value}</span>
        {prev != null && (
          <span style={{ fontSize:12, color: up ? '#059669' : (down ? '#dc2626' : '#64748b') }}>
            {up ? '▲' : (down ? '▼' : '•')} {Math.abs(delta)}
          </span>
        )}
      </div>
    </div>
  );
}

function sumCounts(map?: Record<string, number>) {
  if (!map) return undefined as any;
  return Object.values(map).reduce((a,b)=>a+b,0);
}

// ---------------- Sports Profile Section -----------------
function SportsProfileSection(){
  const [saving, setSaving] = React.useState(false);
  const [toast, setToast] = React.useState<string|undefined>();
  const initial = (): any => {
    try { const j = localStorage.getItem('ps_sports_profile'); if (j) return JSON.parse(j); } catch {}
    return { sports: [] };
  };
  const [data, setData] = React.useState<any>(initial);

  const SPORTS = [
    { code:'football', label:'Football' },
    { code:'futsal', label:'Futsal' },
    { code:'basketball', label:'Basketball' },
    { code:'cricket', label:'Cricket' },
    { code:'volleyball', label:'Volleyball' },
    { code:'badminton', label:'Badminton' },
    { code:'tabletennis', label:'Table Tennis' },
    { code:'tennis', label:'Tennis' },
  ];

  function sportObj(code: string){
    return data.sports.find((s:any)=>s.code===code) || { code, positions:[], skill:3, style:[], dominant:'Right', intensity:'Chill', availability:[], visibility:'Public', notes:'' };
  }
  function upsertSport(obj:any){
    setData((prev:any)=>{
      const exists = prev.sports.findIndex((s:any)=>s.code===obj.code);
      const next = { ...prev };
      if (exists>=0) next.sports = prev.sports.map((s:any,i:number)=> i===exists? obj : s);
      else next.sports = [...prev.sports, obj];
      return next;
    });
  }
  async function save(){
    setSaving(true);
    try {
      localStorage.setItem('ps_sports_profile', JSON.stringify(data));
      const token = localStorage.getItem('ps_token');
      const base = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080';
      // Best-effort backend persistence if supported
      await fetch(`${base}/profiles/me`, { method:'PUT', headers:{ 'Content-Type':'application/json', 'Authorization': token?`Bearer ${token}`:'' }, body: JSON.stringify({ sportsProfile: data }) });
      setToast('Saved'); setTimeout(()=>setToast(undefined), 1800);
    } catch { setToast('Saved locally'); setTimeout(()=>setToast(undefined), 1800); }
    finally { setSaving(false); }
  }

  function Chip({active,onClick,children}:{active?:boolean;onClick:()=>void;children:any}){
    return <button onClick={onClick} className="btn-outline" style={{ background: active?'#003893':'#ffffff', color: active?'#ffffff':'#0f172a' }}>{children}</button>;
  }

  function Positions({code}:{code:string}){
    const MAP: Record<string,string[]> = {
      football:['GK','CB','LB','RB','DM','CM','AM','LW','RW','ST'],
      futsal:['Goalkeeper','Fixo','Ala-L','Ala-R','Pivô'],
      basketball:['PG','SG','SF','PF','C'],
      cricket:['Batter-Opener','Batter-Middle','Finisher','Bowler-Pace','Bowler-Spin','All-rounder','Wicket-keeper'],
      volleyball:['Setter','Opposite','Middle Blocker','Outside Hitter','Libero'],
      badminton:['Singles','Doubles-L','Doubles-R'],
      tabletennis:['Singles','Doubles','Shakehand','Penhold','Offensive','All-round','Defensive'],
      tennis:['Singles','Doubles','Baseliner','All-court','Serve-and-volley']
    };
    const s = sportObj(code);
    const list = MAP[code]||[];
    return (
      <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
        {list.map(opt => (
          <Chip key={opt} active={s.positions.includes(opt)} onClick={()=>{
            const next = { ...s, positions: s.positions.includes(opt)? s.positions.filter((x:string)=>x!==opt) : [...s.positions, opt] };
            upsertSport(next);
          }}>{opt}</Chip>
        ))}
      </div>
    );
  }

  function AvailabilityGrid({code}:{code:string}){
    const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const SLOTS=['Morning','Afternoon','Evening'];
    const s = sportObj(code);
    const key=(d:string,k:string)=>`${d}-${k}`;
    const has=(d:string,k:string)=> s.availability.some((a:any)=>a.day===d && a.slot===k);
    const toggle=(d:string,k:string)=>{ const on=has(d,k); const next = { ...s, availability: on? s.availability.filter((a:any)=>!(a.day===d&&a.slot===k)) : [...s.availability, {day:d,slot:k}] }; upsertSport(next); };
    return (
      <table style={{ width:'100%', borderCollapse:'separate', borderSpacing:6 }}>
        <thead><tr><th></th>{SLOTS.map(sl=><th key={sl} style={{ color:'#0f172a' }}>{sl}</th>)}</tr></thead>
        <tbody>
          {DAYS.map(d=> (
            <tr key={d}>
              <td style={{ color:'#475569' }}>{d}</td>
              {SLOTS.map(sl => (
                <td key={sl}>
                  <button className="btn-outline" style={{ padding:'6px 10px', background: has(d,sl)?'#003893':'#ffffff', color: has(d,sl)?'#ffffff':'#0f172a' }} onClick={()=>toggle(d,sl)}>{has(d,sl)?'✓':''}</button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  const selected = (code:string) => data.sports.some((s:any)=>s.code===code);

  return (
    <div style={{ color:'#0f172a' }}>
      {toast && (
        <div style={{ position:'fixed', top: 16, left:0, right:0, display:'flex', justifyContent:'center', zIndex: 1200 }}>
          <div style={{ background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', padding:'8px 14px', borderRadius:9999, color:'#065f46' }}>{toast}</div>
        </div>
      )}
      <h2>Sports Profile</h2>
      <p className="text-muted" style={{ marginTop:0 }}>Tell us how you play so we can recommend better games.</p>
      <div style={{ margin:'8px 0 8px 0' }}>
        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
          {SPORTS.map(sp => (
            <Chip key={sp.code} active={selected(sp.code)} onClick={()=>{
              if (selected(sp.code)) setData((prev:any)=>({ ...prev, sports: prev.sports.filter((x:any)=>x.code!==sp.code) }));
              else upsertSport(sportObj(sp.code));
            }}>{sp.label}</Chip>
          ))}
        </div>
        <div className="text-muted" style={{ fontSize:12, marginTop:6 }}>Pick all the sports you’re into.</div>
      </div>

      {data.sports.length === 0 && (
        <div style={{ background:'#ffffff', border:'1px solid #e5e7eb', borderRadius:12, padding:12 }}>
          <div className="text-muted">Choose some sports to begin.</div>
        </div>
      )}

      {data.sports.map((s:any) => (
        <div key={s.code} style={{ background:'#ffffff', border:'1px solid #e5e7eb', borderRadius:12, padding:12, marginTop:12 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <strong style={{ fontSize:16 }}>{SPORTS.find(x=>x.code===s.code)?.label}</strong>
            <div>
              <select value={s.visibility} onChange={(e)=>upsertSport({ ...s, visibility:e.target.value })}>
                <option>Public</option><option>Teammates</option><option>Private</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop:8 }}>
            <div style={{ fontWeight:600, marginBottom:6 }}>Choose positions you enjoy most (select many).</div>
            <Positions code={s.code} />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12 }}>
            <div>
              <div style={{ fontWeight:600 }}>Skill (1–5)</div>
              <input type="range" min={1} max={5} value={s.skill} onChange={(e)=>upsertSport({ ...s, skill: Number(e.target.value) })} />
            </div>
            <div>
              <div style={{ fontWeight:600 }}>Dominant hand/foot</div>
              <select value={s.dominant} onChange={(e)=>upsertSport({ ...s, dominant:e.target.value })}><option>Left</option><option>Right</option><option>Both</option></select>
            </div>
            <div>
              <div style={{ fontWeight:600 }}>Intensity</div>
              <select value={s.intensity} onChange={(e)=>upsertSport({ ...s, intensity:e.target.value })}><option>Chill</option><option>Competitive</option><option>Tournament-ready</option></select>
            </div>
          </div>

          <div style={{ marginTop:12 }}>
            <div style={{ fontWeight:600, marginBottom:6 }}>Availability</div>
            <AvailabilityGrid code={s.code} />
            <div className="text-muted" style={{ fontSize:12 }}>Availability helps organizers invite you to the right time slots.</div>
          </div>

          <div style={{ marginTop:12 }}>
            <div style={{ fontWeight:600 }}>Notes (private)</div>
            <textarea value={s.notes} onChange={(e)=>upsertSport({ ...s, notes:e.target.value })} placeholder="Back from ankle sprain" style={{ width:'100%', minHeight:70, border:'1px solid #e5e7eb', borderRadius:8, padding:8 }} />
          </div>
        </div>
      ))}

      <div style={{ marginTop:12 }}>
        <Button onClick={save} disabled={saving}>{saving? 'Saving…' : 'Save'}</Button>
        <span className="text-muted" style={{ marginLeft:8, fontSize:12 }}>{data.sports.length} sports set</span>
      </div>
    </div>
  );
}

function AttendanceLine({ series }: { series: number[] }){
  const width = 320, height = 120, padding = 20;
  const max = Math.max(1, ...series);
  const step = (width - padding*2) / (series.length - 1 || 1);
  const points = series.map((v, i) => [padding + i*step, height - padding - (v/max)*(height - padding*2)] as const);
  const path = points.map((p,i)=> (i===0 ? `M ${p[0]},${p[1]}` : `L ${p[0]},${p[1]}`)).join(' ');
  const gradId = 'att-grad';
  return (
    <svg width={width} height={height} aria-label="Attendance last 12 weeks">
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(220,20,60,0.35)" />
          <stop offset="100%" stopColor="rgba(220,20,60,0.02)" />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke="#DC143C" strokeWidth={2} />
      <path d={`${path} L ${padding+step*(series.length-1)},${height-padding} L ${padding},${height-padding} Z`} fill={`url(#${gradId})`} opacity={0.6} />
    </svg>
  );
}

function triggerConfetti(){
  const root = document.getElementById('confetti-root');
  if (!root) return;
  const c = document.createElement('canvas');
  c.width = root.clientWidth || 600; c.height = 200; c.style.width='100%'; c.style.height='200px'; c.style.display='block';
  root.innerHTML=''; root.appendChild(c);
  const ctx = c.getContext('2d'); if (!ctx) return;
  const particles = Array.from({length:100}).map(()=>({
    x: Math.random()*c.width,
    y: -Math.random()*50,
    vx: (Math.random()-0.5)*2,
    vy: 1+Math.random()*2,
    size: 4+Math.random()*3,
    color: Math.random()>0.5? '#DC143C' : '#003893'
  }));
  let t=0, raf=0;
  const loop=()=>{
    raf = requestAnimationFrame(loop);
    t+=1; ctx.clearRect(0,0,c.width,c.height);
    particles.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; p.vy+=0.02; ctx.fillStyle=p.color; ctx.fillRect(p.x,p.y,p.size,p.size); });
    if (t>200) cancelAnimationFrame(raf);
  }; loop();
}

async function downloadPlayerCard(user: any, stats: any){
  const badges = ['📋','🤝','⭐','💪'];
  const plays = Object.values(stats?.sportCounts||{}).reduce((a:any,b:any)=>a+b,0);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns='http://www.w3.org/2000/svg' width='800' height='420'>
    <defs>
      <linearGradient id='grad' x1='0' x2='1' y1='0' y2='0'>
        <stop offset='0%' stop-color='#1B263B'/>
        <stop offset='50%' stop-color='#003893'/>
        <stop offset='100%' stop-color='#E63946'/>
      </linearGradient>
    </defs>
    <rect width='800' height='420' fill='url(#grad)'/>
    <rect x='16' y='16' width='768' height='388' rx='16' fill='rgba(255,255,255,0.92)'/>
    <text x='40' y='80' font-family='Inter, Mukta, sans-serif' font-size='28' fill='#0E1116' font-weight='700'>${(user?.firstName||'Player')+ ' ' + (user?.lastName||'')}</text>
    <text x='40' y='110' font-family='Inter, Mukta, sans-serif' font-size='16' fill='#1F2937'>@${user?.username||'player'}</text>
    <text x='40' y='150' font-family='Inter, Mukta, sans-serif' font-size='14' fill='#1F2937'>Level: ${(user?.skillLevel||'BEGINNER')}</text>
    <text x='40' y='176' font-family='Inter, Mukta, sans-serif' font-size='14' fill='#1F2937'>Games: ${plays}</text>
    <text x='40' y='202' font-family='Inter, Mukta, sans-serif' font-size='14' fill='#1F2937'>Fair Play: 4.8</text>
    <text x='40' y='228' font-family='Inter, Mukta, sans-serif' font-size='14' fill='#1F2937'>Streak: 3 weeks</text>
    <text x='40' y='270' font-family='Inter, Mukta, sans-serif' font-size='16' fill='#0E1116' font-weight='700'>Top Badges</text>
    <text x='40' y='305' font-size='28'>${badges.join('  ')}</text>
  </svg>`;
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas'); canvas.width = 1600; canvas.height = 840;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(img, 0,0, canvas.width, canvas.height);
    const png = canvas.toDataURL('image/png');
    const a = document.createElement('a'); a.href = png; a.download = 'player-card.png'; a.click();
    URL.revokeObjectURL(url);
  };
  img.src = url;
}

async function persistAvailability(available: boolean){
  try {
    const token = localStorage.getItem('ps_token');
    const base = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080';
    // Try PATCH first if backend supports it
    const patch = await fetch(`${base}/profiles/me`, { method:'PATCH', headers: { 'Content-Type':'application/json', 'Authorization': token ? `Bearer ${token}` : '' }, body: JSON.stringify({ available }) });
    if (!patch.ok) {
      // Fallback to PUT with ETag preconditions
      const res = await fetch(`${base}/profiles/me`, { headers: { 'Authorization': token ? `Bearer ${token}` : '' } });
      const etag = res.headers.get('etag') || undefined;
      await fetch(`${base}/profiles/me`, { method:'PUT', headers: { 'Content-Type':'application/json', ...(etag?{ 'If-Match': etag }:{}), 'Authorization': token ? `Bearer ${token}` : '' }, body: JSON.stringify({ available }) });
    }
  } catch {}
}

// ---------- Top Matches (Mock recommender until backend is ready) ----------
function MatchesForYou(){
  const [items, setItems] = React.useState<any[]>([]);
  React.useEffect(()=>{
    // Read sports profile and compose simple mock matches scored by overlap
    let profile:any = null;
    try { profile = JSON.parse(localStorage.getItem('ps_sports_profile')||'null'); } catch {}
    const picks = new Set((profile?.sports||[]).map((s:any)=>s.code));
    const pos = new Set((profile?.sports||[]).flatMap((s:any)=>s.positions||[]));
    const slots = new Set((profile?.sports||[]).flatMap((s:any)=> (s.availability||[]).map((a:any)=>`${a.day}-${a.slot}`)));
    const mock = [
      { id:1, sport:'football', title:'Evening 7v7 at Riverside', need:['GK','CB'], slot:'Sat-Evening' },
      { id:2, sport:'futsal', title:'Futsal pickup at City Arena', need:['Fixo','Pivô'], slot:'Fri-Evening' },
      { id:3, sport:'basketball', title:'3×3 half-court run', need:['PG','SG'], slot:'Wed-Afternoon' },
    ];
    const scored = mock.map(m=>({ ...m, score: (picks.has(m.sport)?2:0) + (m.need.some(n=>pos.has(n))?2:0) + (slots.has(m.slot)?1:0) }));
    setItems(scored.sort((a,b)=>b.score-a.score));
  }, []);
  if (!items.length) return <div className="text-muted">No picks yet—set your Sports Profile above.</div>;
  return (
    <div style={{ display:'flex', gap:12, overflowX:'auto' }}>
      {items.map(it=> (
        <div key={it.id} style={{ minWidth:260, background:'#ffffff', border:'1px solid #e5e7eb', borderRadius:12, padding:12 }}>
          <div style={{ fontWeight:600 }}>{it.title}</div>
          <div className="text-muted" style={{ fontSize:12 }}>Sport: {it.sport} · Needs: {it.need.join(', ')}</div>
          <div className="text-muted" style={{ fontSize:12 }}>Time: {it.slot.replace('-',' ')}</div>
        </div>
      ))}
    </div>
  );
}
