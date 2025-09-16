// src/pages/GameDetails.tsx - Game Details and Management

import React, { useState } from 'react';
import { useAuth } from '@hooks/useAuth';
import { Button, Card, Badge, Avatar, Modal } from '@components/ui';
import { theme } from '@styles/theme';
import type { Game } from '@app-types/api';

interface GameDetailsProps {
  game: Game;
  onJoin: (gameId: number) => void;
  onLeave: (gameId: number) => void;
  onClose: () => void;
}

export function GameDetails({ game, onJoin, onLeave, onClose }: GameDetailsProps) {
  const { user } = useAuth();
  const [showParticipants, setShowParticipants] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const isParticipant = game.participants?.some(p => p.user.id === user?.id);
  const canJoin = !isParticipant && game.currentPlayers < game.maxPlayers;
  const isFull = game.currentPlayers >= game.maxPlayers;

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      await onJoin(game.id);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async () => {
    await onLeave(game.id);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER': return theme.colors.success;
      case 'INTERMEDIATE': return theme.colors.warning;
      case 'ADVANCED': return theme.colors.error;
      default: return theme.colors.muted;
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div style={{
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        background: 'white',
        borderRadius: theme.radius.lg,
        padding: theme.spacing.xl
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: theme.spacing.lg,
          paddingBottom: theme.spacing.lg,
          borderBottom: `1px solid ${theme.colors.border}`
        }}>
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              margin: '0 0 8px 0',
              color: theme.colors.text
            }}>
              {game.sport} Game
            </h1>
            <p style={{
              fontSize: '16px',
              color: theme.colors.muted,
              margin: '0 0 8px 0'
            }}>
              {game.location}
            </p>
            <div style={{ display: 'flex', gap: theme.spacing.sm }}>
              <Badge 
                variant="primary" 
                style={{ backgroundColor: getSkillLevelColor(game.skillLevel || 'BEGINNER') }}
              >
                {game.skillLevel || 'BEGINNER'}
              </Badge>
              <Badge variant="outline">
                {game.currentPlayers}/{game.maxPlayers} players
              </Badge>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={onClose}
            style={{ padding: '8px' }}
          >
            ✕
          </Button>
        </div>

        {/* Game Details */}
        <div style={{ marginBottom: theme.spacing.lg }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            margin: '0 0 16px 0',
            color: theme.colors.text
          }}>
            Game Details
          </h2>
          
          <div style={{ display: 'grid', gap: theme.spacing.md }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: theme.spacing.md,
              background: theme.colors.background,
              borderRadius: theme.radius.md
            }}>
              <span style={{ fontWeight: '500', color: theme.colors.text }}>Date & Time</span>
              <span style={{ color: theme.colors.muted }}>{formatTime(game.gameTime)}</span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: theme.spacing.md,
              background: theme.colors.background,
              borderRadius: theme.radius.md
            }}>
              <span style={{ fontWeight: '500', color: theme.colors.text }}>Duration</span>
              <span style={{ color: theme.colors.muted }}>{game.durationMinutes} minutes</span>
            </div>
            
            {game.pricePerPlayer && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: theme.spacing.md,
                background: theme.colors.background,
                borderRadius: theme.radius.md
              }}>
                <span style={{ fontWeight: '500', color: theme.colors.text }}>Price per Player</span>
                <span style={{ color: theme.colors.muted }}>Rs. {game.pricePerPlayer}</span>
              </div>
            )}
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: theme.spacing.md,
              background: theme.colors.background,
              borderRadius: theme.radius.md
            }}>
              <span style={{ fontWeight: '500', color: theme.colors.text }}>Created by</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                <Avatar 
                  src={game.createdBy?.avatarUrl} 
                  size="sm"
                />
                <span style={{ color: theme.colors.muted }}>{game.createdBy?.username}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {game.description && (
          <div style={{ marginBottom: theme.spacing.lg }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              margin: '0 0 16px 0',
              color: theme.colors.text
            }}>
              Description
            </h2>
            <p style={{
              fontSize: '14px',
              color: theme.colors.muted,
              lineHeight: '1.6',
              margin: 0
            }}>
              {game.description}
            </p>
          </div>
        )}

        {/* Participants */}
        <div style={{ marginBottom: theme.spacing.lg }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.md
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              margin: 0,
              color: theme.colors.text
            }}>
              Participants ({game.currentPlayers})
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowParticipants(!showParticipants)}
            >
              {showParticipants ? 'Hide' : 'Show'} All
            </Button>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: theme.spacing.sm
          }}>
            {game.participants?.slice(0, showParticipants ? game.participants.length : 4).map((participant, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.sm,
                padding: theme.spacing.sm,
                background: theme.colors.background,
                borderRadius: theme.radius.md,
                border: `1px solid ${theme.colors.border}`
              }}>
                <Avatar 
                  src={participant.user.avatarUrl} 
                  size="sm"
                />
                <div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: theme.colors.text
                  }}>
                    {participant.user.username}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: theme.colors.muted
                  }}>
                    {participant.user.skillLevel}
                  </div>
                </div>
                <Badge 
                  variant={participant.status === 'CONFIRMED' ? 'success' : 'warning'}
                  style={{ marginLeft: 'auto' }}
                >
                  {participant.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: theme.spacing.md,
          justifyContent: 'center',
          paddingTop: theme.spacing.lg,
          borderTop: `1px solid ${theme.colors.border}`
        }}>
          {isParticipant ? (
            <Button
              variant="danger"
              onClick={handleLeave}
              style={{ minWidth: '120px' }}
            >
              Leave Game
            </Button>
          ) : canJoin ? (
            <Button
              variant="primary"
              onClick={handleJoin}
              isLoading={isJoining}
              style={{ minWidth: '120px' }}
            >
              Join Game
            </Button>
          ) : (
            <Button
              variant="outline"
              disabled
              style={{ minWidth: '120px' }}
            >
              {isFull ? 'Game Full' : 'Cannot Join'}
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={onClose}
            style={{ minWidth: '120px' }}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

interface GameDetailsProps {
  game: Game;
  onJoin: (gameId: number) => void;
  onLeave: (gameId: number) => void;
  onClose: () => void;
}
