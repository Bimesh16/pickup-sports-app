import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Avatar, Badge } from '@components/ui';
import { theme } from '@styles/theme';

export default function GameDetailsRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const useMock = String((import.meta as any).env?.VITE_USE_MOCK ?? 'true').toLowerCase() !== 'false';

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        if (useMock) {
          const { default: mod } = await import('./Dashboard');
        }
        // basic fetch; in mock we piggyback on Dashboard's mockApi via dynamic import
        if (useMock) {
          const dash = await import('./Dashboard');
          // @ts-ignore access mockApi exported in module scope (fallback if not exported is empty)
          // if not available, just simulate
          const anyDash: any = dash as any;
          const mockApi = anyDash?.mockApi || {
            getGame: async (gid: number) => ({ id: gid, sport: 'Futsal', location: 'Nepal', gameTime: new Date().toISOString(), currentPlayers: 0, maxPlayers: 10, createdBy: { username: 'organizer' } })
          };
          const data = await mockApi.getGame?.(Number(id));
          if (mounted) setGame(data);
        } else {
          const base = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080';
          const token = localStorage.getItem('ps_token');
          const res = await fetch(`${base}/api/v1/games/${id}`, { headers: { 'Authorization': token ? `Bearer ${token}` : '' } });
          if (res.ok) {
            const data = await res.json();
            if (mounted) setGame(data);
          }
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id, useMock]);

  const handleJoin = async () => {
    if (!game) return;
    setJoining(true);
    try {
      const base = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080';
      const token = localStorage.getItem('ps_token');
      if (useMock) {
        // no-op in mock
      } else {
        await fetch(`${base}/api/v1/games/${game.id}/join`, { method: 'POST', headers: { 'Authorization': token ? `Bearer ${token}` : '' } });
      }
      navigate('/dashboard');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: theme.gradients.sunset, display: 'grid', placeItems: 'center', padding: 16 }}>
        <Card padding="lg" style={{ width: 640 }}>
          <div style={{ height: 20, background: '#e5e7eb', borderRadius: 8, marginBottom: 12 }} />
          <div style={{ height: 14, background: '#e5e7eb', borderRadius: 8, width: '60%', marginBottom: 20 }} />
          <div style={{ height: 120, background: '#f3f4f6', borderRadius: 12 }} />
        </Card>
      </div>
    );
  }

  if (!game) {
    return (
      <div style={{ minHeight: '100vh', background: theme.gradients.sunset, display: 'grid', placeItems: 'center', color: 'white' }}>
        Could not load game.
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.gradients.sunset, display: 'grid', placeItems: 'center', padding: 16 }}>
      <Card padding="lg" style={{ width: 720 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h1 style={{ margin: 0 }}>{game.sport} Game</h1>
            <div style={{ color: '#64748b' }}>{game.location}</div>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
        </div>
        <div style={{ marginBottom: 12, color: '#64748b' }}>Time: {new Date(game.gameTime || game.time).toLocaleString()}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>👥 {game.currentPlayers}/{game.maxPlayers} players</div>
          <Button onClick={handleJoin} isLoading={joining} disabled={game.currentPlayers >= game.maxPlayers}>
            {game.currentPlayers >= game.maxPlayers ? 'Full' : 'Join Game'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

