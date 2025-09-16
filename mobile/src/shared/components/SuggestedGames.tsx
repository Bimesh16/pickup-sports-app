// src/components/SuggestedGames.tsx - Suggested Games List
import React, { useEffect, useState } from 'react';
import { GameCard } from '@components/GameCard';
import { useNavigate } from 'react-router-dom';

export default function SuggestedGames({ preferred, onJoin }: { preferred?: string; onJoin: (id: number) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const useMock = String((import.meta as any).env?.VITE_USE_MOCK ?? 'true').toLowerCase() !== 'false';
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        if (useMock) {
          const dash = await import('@pages/Dashboard');
          const anyDash: any = dash as any;
          const mockApi = anyDash?.mockApi;
          if (mockApi?.getGames) {
            const list = await mockApi.getGames({});
            let recs = list;
            if (preferred) {
              recs = list.filter((g: any) => String(g.sport).toLowerCase() === String(preferred).toLowerCase());
              if (recs.length === 0) recs = list.slice(0, 2);
            } else {
              recs = list.slice(0, 2);
            }
            if (mounted) setItems(recs.slice(0, 3));
          } else {
            if (mounted) setItems([]);
          }
        } else {
          const base = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080';
          const token = localStorage.getItem('ps_token');
          const res = await fetch(`${base}/api/v1/ai/recommendations/games?limit=5`, { headers: { 'Authorization': token ? `Bearer ${token}` : '' } });
          if (res.ok) {
            const data = await res.json();
            const mapped = Array.isArray(data) ? data.map((r: any) => ({
              id: r.gameId || r.id || Math.random(),
              sport: r.sport || r.game?.sport || 'Game',
              time: r.gameTime || r.time || r.game?.time || new Date().toISOString(),
              location: r.location || r.venueName || 'Nearby',
              currentPlayers: r.currentPlayers || r.players?.current || r.game?.currentPlayers || 0,
              maxPlayers: r.maxPlayers || r.players?.max || r.game?.maxPlayers || undefined,
              creatorName: r.createdBy?.username || r.organizer || undefined,
              status: r.status || r.game?.status || 'ACTIVE'
            })) : [];
            if (mounted) setItems(mapped.slice(0, 3));
          } else {
            if (mounted) setItems([]);
          }
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [preferred]);

  if (loading) {
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 12, background: '#fff' }}>
            <div style={{ height: 14, background: '#e5e7eb', borderRadius: 8, width: '30%', marginBottom: 8 }} />
            <div style={{ height: 12, background: '#e5e7eb', borderRadius: 8, width: '60%' }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {items.map((g) => (
        <div key={g.id} style={{ display: 'grid', gap: 8 }}>
          <GameCard g={g as any} onClick={() => navigate(`/games/${g.id}`)} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => navigate(`/games/${g.id}`)} style={{ padding: '6px 10px', borderRadius: 10, background: '#f1f5f9', color: '#0f172a', border: '1px solid #e2e8f0', fontWeight: 600 }}>View Details</button>
            <button onClick={() => onJoin(g.id)} style={{ padding: '6px 10px', borderRadius: 10, background: '#dc143c', color: 'white', border: 'none', fontWeight: 600 }}>Join</button>
          </div>
        </div>
      ))}
    </>
  );
}

