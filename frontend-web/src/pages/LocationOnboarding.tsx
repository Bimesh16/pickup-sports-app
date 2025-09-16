// src/pages/LocationOnboarding.tsx - First-run location setup
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '@components/ui';
import { NEPAL_LOCATIONS } from '@constants/nepal';

type Loc = { lat: number; lng: number; name: string };

export default function LocationOnboarding() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<Loc | null>(null);

  const options = useMemo(() => {
    const arr = Object.values(NEPAL_LOCATIONS) as Loc[];
    if (!search.trim()) return arr;
    const q = search.toLowerCase();
    return arr.filter(x => x.name.toLowerCase().includes(q));
  }, [search]);

  const saveLocation = async (loc: Loc) => {
    try {
      localStorage.setItem('ps_user_location', JSON.stringify(loc));
    } catch {}
    // Persist to backend profile (location field)
    try {
      const token = localStorage.getItem('ps_token');
      const base = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080';
      const res = await fetch(`${base}/profiles/me`, { headers: { 'Authorization': token ? `Bearer ${token}` : '' } });
      const etag = res.headers.get('etag') || undefined;
      await fetch(`${base}/profiles/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(etag ? { 'If-Match': etag } : {}),
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ location: loc.name })
      });
    } catch {}
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-nepal-blue via-slate-900 to-nepal-crimson p-4 text-white">
      <Card padding="lg" style={{ width: 640, maxWidth: '100%' }}>
        <h1 className="text-2xl font-bold mb-1">Choose your location</h1>
        <p className="text-sm text-white/80 mb-4">Use your current location or pick a city to personalize games near you.</p>
        {error && <div className="mb-3 rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</div>}
        <div className="flex gap-2 mb-3">
          <Button
            onClick={() => {
              if (!navigator.geolocation) { setError('Geolocation not supported.'); return; }
              setBusy(true); setError(null);
              navigator.geolocation.getCurrentPosition(
                (pos) => saveLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, name: 'Your Location' }),
                () => { setBusy(false); setError('Permission blocked. Reset in Site Info or pick a city below.'); },
                { enableHighAccuracy: true, timeout: 8000 }
              );
            }}
            disabled={busy}
          >{busy ? 'Detecting…' : 'Use my location'}</Button>
          <input className="flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm placeholder-white/60"
            placeholder="Search a city (e.g., Kathmandu)"
            value={search} onChange={(e)=>setSearch(e.target.value)} />
        </div>
        <div className="max-h-64 overflow-y-auto rounded-lg border border-white/10">
          {(options as Loc[]).map((loc) => (
            <button key={loc.name} onClick={()=>setSelected(loc)}
              className={`w-full text-left px-3 py-2 text-sm ${selected?.name===loc.name?'bg-white/10':'hover:bg-white/5'}`}>{loc.name}
              <span className="text-white/60"> ({loc.lat.toFixed(4)}, {loc.lng.toFixed(4)})</span>
            </button>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={()=>navigate('/dashboard')}>Skip</Button>
          <Button onClick={()=>{ if (selected) saveLocation(selected); else setError('Select a city or use your location.'); }}>Save</Button>
        </div>
      </Card>
    </div>
  );
}

