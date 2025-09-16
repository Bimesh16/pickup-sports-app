import React from 'react';
import type { GameSummaryDTO } from '@app-types/api';
import { Card, Badge } from '@components/ui';
import { theme } from '@styles/theme';

export function GameCard({ g, onClick }: { g: GameSummaryDTO | undefined | null; onClick?: () => void }) {
  if (!g) {
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('GameCard: received null/undefined game');
    }
    return null;
  }
  if (typeof g !== 'object') {
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('GameCard: expected object but received', g);
    }
    return null;
  }
  const missing: string[] = [];
  if (!('sport' in g) || (g as any).sport == null) missing.push('sport');
  if (!('time' in g) || (g as any).time == null) missing.push('time');
  if (!('location' in g) || (g as any).location == null) missing.push('location');
  if (missing.length && typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn('GameCard: incomplete game data', { missing, g });
  }
  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ACTIVE': return '#22c55e';
      case 'FULL': return '#f59e0b';
      case 'CANCELLED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getSkillLevelColor = (skillLevel?: string) => {
    switch (skillLevel?.toLowerCase()) {
      case 'beginner': return '#3b82f6';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div 
      onClick={onClick}
      style={{ 
        border: '1px solid #e5e7eb', 
        borderRadius: 12, 
        padding: 16,
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        transition: 'box-shadow 0.2s ease-in-out',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ 
            fontSize: 18, 
            fontWeight: '600', 
            color: '#1f2937' 
          }}>
            {g.sport ?? 'Game'}
          </span>
          {g.skillLevel && (
            <span style={{
              fontSize: 12,
              padding: '2px 8px',
              borderRadius: 12,
              backgroundColor: getSkillLevelColor(g.skillLevel) + '20',
              color: getSkillLevelColor(g.skillLevel),
              fontWeight: '500'
            }}>
              {g.skillLevel}
            </span>
          )}
        </div>
        <span style={{ 
          fontSize: 14, 
          color: '#6b7280',
          fontWeight: '500'
        }}>
          {formatTime(g.time)}
        </span>
      </div>
      
      <div style={{ 
        color: '#374151', 
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '500'
      }}>
        📍 {g.location ?? 'Nearby'}
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        fontSize: 13, 
        color: '#6b7280'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span>
            👥 {(g.currentPlayers ?? 0)}/{g.maxPlayers ?? '-'} players
          </span>
          {g.creatorName && (
            <span>
              👤 {g.creatorName}
            </span>
          )}
        </div>
        <span style={{
          padding: '2px 6px',
          borderRadius: 6,
          backgroundColor: getStatusColor(g.status ?? 'ACTIVE') + '20',
          color: getStatusColor(g.status ?? 'ACTIVE'),
          fontWeight: '500',
          fontSize: 11
        }}>
          {g.status ?? 'UNKNOWN'}
        </span>
      </div>
    </div>
  );
}
