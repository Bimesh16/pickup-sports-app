import { http } from '@lib/http';
import type { GameSummaryDTO } from '@app-types/api';

export async function nearbyGames(params: { latitude: number; longitude: number; radiusKm?: number; sport?: string; skillLevel?: string }) {
  const q = new URLSearchParams();
  q.set('latitude', String(params.latitude));
  q.set('longitude', String(params.longitude));
  if (params.radiusKm) q.set('radiusKm', String(params.radiusKm));
  if (params.sport) q.set('sport', params.sport);
  if (params.skillLevel) q.set('skillLevel', params.skillLevel);
  return http<GameSummaryDTO[]>(`/api/v1/games/nearby?${q.toString()}`, { method: 'GET' });
}

export async function trendingGames(params?: { latitude?: number; longitude?: number }) {
  const q = new URLSearchParams();
  if (params?.latitude != null) q.set('latitude', String(params.latitude));
  if (params?.longitude != null) q.set('longitude', String(params.longitude));
  return http<GameSummaryDTO[]>(`/api/v1/games/trending?${q.toString()}`, { method: 'GET' });
}
