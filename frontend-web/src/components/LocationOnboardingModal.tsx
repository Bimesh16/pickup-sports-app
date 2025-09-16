// src/components/LocationOnboardingModal.tsx - First run location preference modal
import React, { useEffect, useMemo, useState } from 'react';
import { Card, Button } from '@components/ui';
import { COUNTRIES } from '@lib/constants';
import { COUNTRY_LOCATIONS, getCountryDefaultCenter, NEPAL_PROVINCE_GROUPS } from '@constants/geo';

type Loc = { lat: number; lng: number; name: string };

export default function LocationOnboardingModal({
  open,
  onClose,
  onSave,
  enforce = false
}: {
  open: boolean;
  onClose: () => void;
  onSave: (loc: Loc) => void;
  enforce?: boolean;
}) {
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<Loc | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [country, setCountry] = useState<string>(() => {
    try { return localStorage.getItem('ps_last_country') || 'Nepal'; } catch { return 'Nepal'; }
  });
  const [mode, setMode] = useState<'list' | 'map'>('list');

  const options = useMemo(() => {
    const arr = (COUNTRY_LOCATIONS[country] ?? []) as Loc[];
    const base = search.trim()
      ? arr.filter(x => x.name.toLowerCase().includes(search.toLowerCase()))
      : arr;
    return [...base].sort((a, b) => a.name.localeCompare(b.name));
  }, [search, country]);

  const groupedOptions = useMemo(() => {
    if (country !== 'Nepal') return null as null | { title: string; items: Loc[] }[];
    const groups = Object.entries(NEPAL_PROVINCE_GROUPS).map(([title, items]) => {
      const filtered = search.trim()
        ? items.filter(x => x.name.toLowerCase().includes(search.toLowerCase()))
        : items;
      return { title, items: [...filtered].sort((a, b) => a.name.localeCompare(b.name)) };
    }).filter(g => g.items.length > 0);
    return groups;
  }, [country, search]);

  useEffect(() => {
    if (!open) {
      setError(null);
      setBusy(false);
      setSearch('');
      setSelected(null);
    }
  }, [open]);

  useEffect(() => {
    try { localStorage.setItem('ps_last_country', country); } catch {}
  }, [country]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <Card padding="lg" style={{ width: 520, maxWidth: '100%', position: 'relative' }}>
        {toast && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/40 px-3 py-1 text-xs">
            {toast}
          </div>
        )}
        <h2 className="text-xl font-semibold mb-2">Set your location</h2>
        <p className="text-sm text-gray-600 mb-4">Use your current location or pick a city to personalize nearby games and recommendations.</p>

        {error && (
          <div className="mb-3 rounded-md bg-red-50 p-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-2 mb-3">
          <Button
            onClick={() => {
              if (!navigator.geolocation) {
                setError('Geolocation not supported by this browser.');
                return;
              }
              setBusy(true);
              setError(null);
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  const loc: Loc = { lat: pos.coords.latitude, lng: pos.coords.longitude, name: 'Your Location' };
                  onSave(loc);
                },
                () => {
                  setBusy(false);
                  setError('Location permission is blocked or denied. Click the site info (tune) icon near the URL to reset permissions, or choose a city below.');
                },
                { enableHighAccuracy: true, timeout: 8000 }
              );
            }}
            disabled={busy}
          >
            {busy ? 'Detecting…' : 'Use my location'}
          </Button>
          <div className="flex gap-2 items-center">
            <button className={`px-3 py-2 text-sm rounded-lg border ${mode==='list' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'}`} onClick={() => setMode('list')}>
              List
            </button>
            <button className={`px-3 py-2 text-sm rounded-lg border ${mode==='map' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'}`} onClick={() => setMode('map')}>
              Map
            </button>
          </div>
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={country}
            onChange={(e) => { setCountry(e.target.value); setSelected(null); setSearch(''); }}
            aria-label="Select country"
          >
            {COUNTRIES.map(c => (
              <option key={c.name} value={c.name}>{c.flag} {c.name}</option>
            ))}
          </select>
          <input
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="Search a city (e.g., Kathmandu)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {mode === 'list' ? (
          <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-200">
            {country === 'Nepal' && groupedOptions ? (
              groupedOptions.length > 0 ? (
                groupedOptions.map(group => (
                  <div key={group.title}>
                    <div className="sticky top-0 bg-white px-3 py-1 text-xs font-semibold text-gray-700 border-b border-gray-200">{group.title}</div>
                    {group.items.map(loc => (
                      <button
                        key={group.title + ':' + loc.name}
                        onClick={() => setSelected(loc)}
                        className={`w-full text-left px-3 py-2 text-sm ${selected?.name === loc.name ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                      >
                        {loc.name} <span className="text-gray-500">({loc.lat.toFixed(4)}, {loc.lng.toFixed(4)})</span>
                      </button>
                    ))}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-600">No matches for your search.</div>
              )
            ) : (
              options.length > 0 ? (
                options.map((loc) => (
                  <button
                    key={loc.name}
                    onClick={() => setSelected(loc)}
                    className={`w-full text-left px-3 py-2 text-sm ${selected?.name === loc.name ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  >
                    {loc.name} <span className="text-gray-500">({loc.lat.toFixed(4)}, {loc.lng.toFixed(4)})</span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-600">
                  We don't have a curated list for {country} yet. Use "Use my location" above, or switch to another country.
                </div>
              )
            )}
          </div>
        ) : (
          <MapPicker
            selected={selected}
            onSelect={(loc) => {
              setSelected(loc);
              try { localStorage.setItem('ps_last_pin', JSON.stringify({ lat: loc.lat, lng: loc.lng })); } catch {}
            }}
            center={() => {
              try {
                const raw = localStorage.getItem('ps_last_pin');
                if (raw) { const p = JSON.parse(raw); return [p.lng, p.lat] as [number, number]; }
              } catch {}
              const def = getCountryDefaultCenter(country);
              if (def) return [def.lng, def.lat] as [number, number];
              return [85.3240, 27.7172] as [number, number];
            }}
          />
        )}

        {selected && (
          <div className="mt-3 text-xs text-gray-600">
            <div className="mb-1">Open in:</div>
            <div className="flex gap-2 flex-wrap">
              <a className="underline text-blue-600" target="_blank" rel="noreferrer"
                href={`https://www.google.com/maps/search/?api=1&query=${selected.lat},${selected.lng}`}>Google Maps</a>
              <a className="underline text-blue-600" target="_blank" rel="noreferrer"
                href={`https://maps.apple.com/?ll=${selected.lat},${selected.lng}&q=${encodeURIComponent(selected.name)}`}>Apple Maps</a>
              <a className="underline text-blue-600" target="_blank" rel="noreferrer"
                href={`https://waze.com/ul?ll=${selected.lat}%2C${selected.lng}&navigate=yes`}>Waze</a>
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          {!enforce && <Button variant="outline" onClick={onClose}>Not now</Button>}
          <Button onClick={async () => {
            if (!selected) { setError('Select a city or use your current location.'); return; }
            // Persist locally
            try { localStorage.setItem('ps_user_location', JSON.stringify(selected)); } catch {}
            // Persist to backend profile
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
                body: JSON.stringify({ location: selected.name, latitude: selected.lat, longitude: selected.lng })
              });
            } catch {}
            setToast('Location set, showing games near you');
            setTimeout(() => { setToast(null); onSave(selected); }, 1200);
          }}>Save</Button>
        </div>
      </Card>
    </div>
  );
}

// Lightweight MapLibre picker using global maplibregl (loaded via CDN in index.html)
function MapPicker({ selected, onSelect, center }: { selected: { lat: number; lng: number; name: string } | null; onSelect: (l: { lat: number; lng: number; name: string }) => void; center: () => [number, number] }) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const markerRef = React.useRef<any>(null);
  const mapRef = React.useRef<any>(null);
  useEffect(() => {
    const gl: any = (window as any).maplibregl;
    if (!ref.current || !gl) return;
    if (mapRef.current) return;
    const initial = selected ? [selected.lng, selected.lat] : center();
    const map = new gl.Map({
      container: ref.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: initial,
      zoom: selected ? 11 : 6,
    });
    mapRef.current = map;
    const createOrMoveMarker = (lng: number, lat: number) => {
      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      } else {
        markerRef.current = new gl.Marker({ draggable: true }).setLngLat([lng, lat]).addTo(map);
        markerRef.current.on('dragend', () => {
          const ll = markerRef.current.getLngLat();
          onSelect({ lat: ll.lat, lng: ll.lng, name: 'Pinned Location' });
        });
      }
      onSelect({ lat, lng, name: 'Pinned Location' });
    };
    map.on('click', (e: any) => {
      createOrMoveMarker(e.lngLat.lng, e.lngLat.lat);
    });
    if (selected) createOrMoveMarker(selected.lng, selected.lat);
    return () => { try { map.remove(); } catch {} };
  }, [selected, onSelect, center]);

  // Re-center if center() changes (e.g., country switched) and no selection yet
  useEffect(() => {
    if (!mapRef.current || selected) return;
    try {
      const c = center();
      mapRef.current.setCenter(c);
    } catch {}
  }, [center, selected]);

  return (
    <div>
      <div ref={ref} style={{ height: 300, borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb' }} />
      <div className="text-xs text-gray-600 mt-2">Click on the map to drop a pin. Drag the pin to refine.</div>
    </div>
  );
}
