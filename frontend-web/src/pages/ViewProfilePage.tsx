import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '@styles/premium-ui.css';
import { PlayerCard } from '@components/profile/PlayerCard';
import { CompletionMeter } from '@components/profile/CompletionMeter';
import { BadgeGrid } from '@components/profile/BadgeGrid';
import { ActivityList } from '@components/profile/ActivityList';
import { SessionList } from '@components/profile/SessionList';
import { EditProfileModal } from '@components/profile/EditProfileModal';
import { useAuth } from '@hooks/useAuth';
import { Card, Button } from '@components/ui';
import { theme } from '@styles/theme';

export default function ViewProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [active, setActive] = React.useState<'overview'|'activity'|'stats'|'badges'|'teams'|'sports'>(() => {
    const section = searchParams.get('section') || 'overview';
    const allowed = ['overview','activity','stats','badges','teams','sports'];
    return (allowed.includes(section) ? (section as any) : 'overview');
  });

  React.useEffect(() => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('section', active);
      return newParams;
    });
  }, [active, setSearchParams]);

  // Keyboard navigation for sub-tabs (ARIA Tabs pattern)
  const tabsRef = React.useRef<HTMLDivElement>(null);
  const handleTabsKey = (e: React.KeyboardEvent) => {
    const order: any[] = ['overview','activity','stats','badges','teams','sports'];
    let idx = order.indexOf(active);
    if (e.key === 'ArrowRight') { idx = (idx+1)%order.length; setActive(order[idx] as any); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { idx = (idx-1+order.length)%order.length; setActive(order[idx] as any); e.preventDefault(); }
    if (e.key === 'Home') { setActive(order[0] as any); e.preventDefault(); }
    if (e.key === 'End') { setActive(order[order.length-1] as any); e.preventDefault(); }
  };

  const [toast, setToast] = React.useState<string | null>(null);
  const [showInvite, setShowInvite] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [availability, setAvailability] = React.useState<boolean>(() => localStorage.getItem('ps_avail') !== '0');
  const [stats, setStats] = React.useState<{ sportCounts: Record<string, number>; weekdayTime?: number[][] } | null>(null);
  const [streakWeeks, setStreakWeeks] = React.useState<number>(3);

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
        }
      } catch {}
    })();
  }, []);

  const completion = React.useMemo(() => {
    let pct = 40; const nudges: string[] = [];
    if (!user?.avatarUrl) nudges.push('Add a photo (+10%)'); else pct += 10;
    if (!(user as any)?.isVerified) nudges.push('Verify email (+5%)'); else pct += 5;
    if (!user?.bio) nudges.push('Add a short bio (+5%)'); else pct += 5;
    return { pct: Math.min(100, pct), nudges };
  }, [user?.avatarUrl, (user as any)?.isVerified, user?.bio]);

  const handleEdit = () => {
    navigate('/profile/edit?mode=sheet');
  };

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
          
          <div style={{ marginBottom: theme.spacing.lg }}>
            <PlayerCard
              avatarUrl={user?.avatarUrl}
              displayName={`${user?.firstName||''} ${user?.lastName||''}`.trim() || (user?.username||'')}
              username={user?.username || ''}
              level={(user?.skillLevel as any) || 'BEGINNER'}
              jerseyNumber={(user as any)?.jerseyNumber}
              city={(user as any)?.location || undefined}
              onEdit={handleEdit}
              onShare={() => { try { navigator.share?.({ title:'My profile', url: window.location.href }); } catch {} }}
              onShowQr={() => setShowInvite(true)}
              onCopyInvite={() => { 
                navigator.clipboard?.writeText(`${window.location.origin}/profile/${user?.username}`); 
                setToast('Invite link copied'); 
                setTimeout(() => setToast(null), 2000); 
              }}

            />
            
            <Button variant="primary" onClick={handleEdit}>
              Edit Profile
            </Button>
            
            <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', position:'relative', zIndex:1 }}>
              <label style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#ffffff', border:'1px solid #e5e7eb', padding:'6px 10px', borderRadius:12 }}>
                <input 
                  type="checkbox" 
                  checked={availability} 
                  onChange={async (e) => { 
                    const v = e.target.checked; 
                    setAvailability(v); 
                    try { localStorage.setItem('ps_avail', v?'1':'0'); } catch {}
                    setToast(v ? 'Available' : 'Unavailable'); 
                    setTimeout(() => setToast(null), 1500); 
                  }} 
                />
                <span className="text-strong">Availability</span>
              </label>
            </div>
          </div>

          <div style={{ marginBottom: theme.spacing.lg, position:'relative', zIndex:1 }}>
            <CompletionMeter percent={completion.pct} nudges={completion.nudges} />
            <div style={{ marginTop: 8, background:'#ffffff', border:'1px solid #e5e7eb', borderRadius:12, padding:12, color:'#0f172a' }}>
              <div style={{ fontWeight:700, marginBottom:6 }}>Privacy preview</div>
              <div className="text-muted" style={{ fontSize: 13, color:'#475569' }}>Visible to others: avatar, display name, @tag, level, preferred sport. Hidden: email, phone.</div>
            </div>
          </div>

          <Card style={{ padding: theme.spacing.xl, background:'#ffffff', border:'1px solid #e5e7eb' }}>
            <div ref={tabsRef} onKeyDown={handleTabsKey} role="tablist" aria-label="Profile sections" style={{ position:'sticky', top: 12, zIndex: 10, background:'#ffffff', display:'flex', gap:8, flexWrap:'wrap', marginBottom:16, paddingBottom:8 }}>
              {(['overview','activity','stats','badges','teams','sports'] as const).map(k => (
                <button
                  key={k}
                  role="tab"
                  aria-selected={active===k}
                  className="btn-outline"
                  onClick={() => setActive(k)}
                >{k[0].toUpperCase()+k.slice(1)}</button>
              ))}
            </div>

            {active === 'overview' && (
              <div>
                <h2>Overview</h2>
                <div style={{ marginBottom: 16, padding: 12, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Bio</div>
                  <div className="text-muted">{user?.bio || 'No bio added yet'}</div>
                </div>
                
                <div style={{ display:'grid', gap:12, gridTemplateColumns:'1fr 1fr' }}>
                  <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:12, background:'#fff' }}>
                    <div style={{ fontWeight:600, marginBottom:6 }}>Next match</div>
                    <div className="text-muted" style={{ fontSize:13 }}>No RSVP yet. Find a game and RSVP to see it here.</div>
                  </div>
                  <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:12, background:'#fff' }}>
                    <div style={{ fontWeight:600, marginBottom:6 }}>Highlights</div>
                    <ul className="text-muted" style={{ margin:0, paddingLeft:18 }}>
                      <li>Fair play score: 4.8</li>
                      <li>Streak: 3 games</li>
                      <li>Most played: {(stats?.sportCounts && Object.keys(stats.sportCounts)[0]) || 'Futsal'}</li>
                    </ul>
                  </div>
                </div>

                <div style={{ marginTop:12, background:'linear-gradient(90deg, rgba(0,56,147,0.12), rgba(220,20,60,0.12))', border:'1px solid #e5e7eb', borderRadius:12, padding:'10px 12px', display:'flex', alignItems:'center', gap:8 }}>
                  <span>🔥</span>
                  <div style={{ fontWeight:700, color:'#0f172a' }}>{streakWeeks}-week streak</div>
                  <div className="text-muted" style={{ fontSize:13 }}>&nbsp;Keep it up! Don't break the chain.</div>
                </div>
              </div>
            )}

            {active === 'activity' && (
              <div>
                <h2>Activity</h2>
                <ActivityList items={[]} />
              </div>
            )}

            {active === 'stats' && (
              <div>
                <h2>Statistics</h2>
                <div className="text-muted">Your game statistics will appear here.</div>
              </div>
            )}

            {active === 'badges' && (
              <div>
                <h2>Badges</h2>
                <BadgeGrid badges={[]} />
              </div>
            )}

            {active === 'teams' && (
              <div>
                <h2>Teams</h2>
                <div className="text-muted">Your team memberships will appear here.</div>
              </div>
            )}

            {active === 'sports' && (
              <div>
                <h2>Sports</h2>
                <div className="text-muted">Your sports preferences and history will appear here.</div>
              </div>
            )}
          </Card>
        </main>
      </div>
      
      <EditProfileModal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
      />
    </div>
  );
}