from pathlib import Path

content = '''import React from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Game } from '@app-types/api';
import { gamesApi } from '@api/dashboard';
import { mockDashboardApi } from './mockData';

const formatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  hour: 'numeric',
  minute: '2-digit',
});

function GameTile({ game }: { game: Game }) {
  return (
    <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-royal)]">{game.sport}</p>
          <h3 className="mt-1 text-lg font-semibold text-[var(--text)]">{game.location}</h3>
        </div>
        <span className="rounded-full bg-[var(--brand-crimson)]/10 px-3 py-1 text-xs font-semibold text-[var(--brand-crimson)]">
          {game.skillLevel?.toLowerCase()}
        </span>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm text-[var(--text-3)]">
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--text-3)]">Kickoff</dt>
          <dd className="text-[var(--text-2)]">{formatter.format(new Date(game.gameTime))}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--text-3)]">Players</dt>
          <dd className="text-[var(--text-2)]">{game.currentPlayers}/{game.maxPlayers}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--text-3)]">Venue</dt>
          <dd className="text-[var(--text-2)]">{game.venue?.name}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--text-3)]">Cost</dt>
          <dd className="text-[var(--text-2)]">{game.pricePerPlayer ?  : 'Free'}</dd>
        </div>
      </dl>
      <p className="mt-4 text-sm text-[var(--text-3)]">{game.description}</p>
      <div className="mt-6 flex items-center justify-between gap-3 text-sm">
        <button className="rounded-full bg-[var(--brand-royal)] px-4 py-2 font-semibold text-white transition hover:bg-[var(--brand-royal)]/90">View details</button>
        <button className="rounded-full border border-[var(--brand-crimson)] px-4 py-2 font-semibold text-[var(--brand-crimson)] transition hover:bg-[var(--brand-crimson)]/10">Join game</button>
      </div>
    </article>
  );
}

export default function GamesPage() {
  const useMock = String((import.meta as any).env?.VITE_USE_MOCK ?? 'true').toLowerCase() !== 'false';
  const { data: games = [], isLoading } = useQuery<Game[]>({
    queryKey: ['dashboard', 'games', useMock],
    queryFn: async () => {
      if (useMock) return mockDashboardApi.getGames();
      try {
        const res = await gamesApi.list();
        return res;
      } catch (error) {
        console.warn('Falling back to mock games', error);
        return mockDashboardApi.getGames();
      }
    },
  });

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-r from-[var(--brand-navy)] to-[var(--brand-royal)] p-8 text-white shadow-xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-white/70">Kathmandu Valley</p>
            <h1 className="mt-3 text-3xl font-bold md:text-4xl">This week’s pickup spotlight</h1>
            <p className="mt-2 max-w-xl text-sm text-white/80">Track your upcoming sessions, confirm attendance, and surface venues where your crew loves to compete.</p>
          </div>
          <div className="grid gap-3 rounded-2xl bg-white/10 p-6 text-sm backdrop-blur">
            <p className="text-xs uppercase text-white/70">Upcoming commitments</p>
            <div className="text-3xl font-bold">{games.length}</div>
            <p className="text-white/70">matches scheduled</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text)]">Nearby games</h2>
          <button className="text-sm font-semibold text-[var(--brand-royal)] hover:text-[var(--brand-crimson)]">Filter</button>
        </header>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-48 animate-pulse rounded-xl bg-[var(--bg-muted)]" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {games.map((game) => (<GameTile key={game.id} game={game} />))}
          </div>
        )}
      </section>
    </div>
  );
}
'''
Path('src/pages/dashboard/GamesPage.tsx').write_text(content)
