import React, { useState, useEffect } from 'react';
import { GameDetailsDTO } from '../api';

interface GameDetailsProps {
  gameId: number;
  onBack: () => void;
}

interface Team {
  id: number;
  teamName: string;
  teamColor: string;
  teamNumber: number;
  captain?: {
    id: number;
    username: string;
    skillLevel: string;
  };
  members: Array<{
    id: number;
    user: {
      id: number;
      username: string;
      skillLevel: string;
    };
    preferredPosition?: string;
    assignedPosition?: string;
    isSubstitute: boolean;
    paymentStatus: string;
    checkedInAt?: string;
  }>;
  activePlayersCount: number;
  averageSkillLevel: number;
  status: string;
}

export function GameDetails({ gameId, onBack }: GameDetailsProps) {
  const [game, setGame] = useState<GameDetailsDTO | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningGame, setJoiningGame] = useState(false);

  useEffect(() => {
    loadGameDetails();
  }, [gameId]);

  const loadGameDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/games/${gameId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load game details');
      }

      const gameData = await response.json();
      setGame(gameData);

      // Load team information
      const teamsResponse = await fetch(`/api/games/${gameId}/teams`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (teamsResponse.ok) {
        const teamsData = await teamsResponse.json();
        setTeams(teamsData);
      }
      
    } catch (err: any) {
      setError(err.message || 'Failed to load game details');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async (preferredPosition?: string) => {
    if (!game) return;
    
    setJoiningGame(true);
    
    try {
      const requestBody: any = {};
      if (preferredPosition) {
        requestBody.preferredPosition = preferredPosition;
      }

      const response = await fetch(`/api/games/${gameId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to join game');
      }

      // Refresh game details to show updated teams
      await loadGameDetails();
      alert('Successfully joined the game! You will receive team assignment shortly.');
      
    } catch (err: any) {
      alert(err.message || 'Failed to join game');
    } finally {
      setJoiningGame(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>🔄 Loading game details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <button onClick={onBack} style={{ marginBottom: '1rem' }}>← Back</button>
        <div style={{ color: '#FF4444', textAlign: 'center' }}>
          ❌ {error}
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Game not found</div>
        <button onClick={onBack} style={{ marginTop: '1rem' }}>← Back</button>
      </div>
    );
  }

  const getSportEmoji = (sport: string) => {
    const emojiMap: Record<string, string> = {
      'Soccer': '⚽', 'Basketball': '🏀', 'Football': '🏈', 'Volleyball': '🏐', 'Tennis': '🎾'
    };
    return emojiMap[sport] || '🏃‍♂️';
  };

  const getSkillLevelColor = (level: string) => {
    const colorMap: Record<string, string> = {
      'BEGINNER': '#28a745', 'INTERMEDIATE': '#ffc107', 'ADVANCED': '#fd7e14', 'PRO': '#dc3545'
    };
    return colorMap[level] || '#6c757d';
  };

  const getPaymentStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'PAID': '#28a745', 'PENDING': '#ffc107', 'FAILED': '#dc3545', 'WAIVED': '#17a2b8'
    };
    return colorMap[status] || '#6c757d';
  };

  const canJoinGame = game.participantCount < game.maxPlayers && game.status === 'PUBLISHED';

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button 
          onClick={onBack}
          style={{ 
            background: 'none', 
            border: 'none', 
            fontSize: '1.5rem', 
            cursor: 'pointer',
            marginRight: '0.5rem'
          }}
        >
          ←
        </button>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Game Details</h1>
      </div>

      {/* Game Info Card */}
      <div style={{ 
        backgroundColor: 'white',
        border: '1px solid #e1e5e9',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>
              {getSportEmoji(game.sport)} {game.templateName || game.sport}
            </h2>
            <p style={{ margin: '0.5rem 0', color: '#666' }}>📍 {game.location}</p>
            {game.description && (
              <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', lineHeight: '1.4' }}>
                {game.description}
              </p>
            )}
          </div>
          
          <div style={{ 
            backgroundColor: getSkillLevelColor(game.skillLevel),
            color: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '12px',
            fontSize: '0.8rem',
            fontWeight: '500'
          }}>
            {game.skillLevel || 'Any Level'}
          </div>
        </div>

        {/* Game Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#007bff' }}>
              {game.participantCount || 0}/{game.maxPlayers}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>Players</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
              ${game.pricePerPlayer ? game.pricePerPlayer.toFixed(2) : '0.00'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>Per Player</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fd7e14' }}>
              {game.durationMinutes || 90}min
            </div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>Duration</div>
          </div>
        </div>

        {/* Join Button */}
        {canJoinGame && (
          <div style={{ textAlign: 'center' }}>
            <button 
              onClick={() => handleJoinGame()}
              disabled={joiningGame}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: joiningGame ? 'not-allowed' : 'pointer',
                opacity: joiningGame ? 0.7 : 1
              }}
            >
              {joiningGame ? '🔄 Joining...' : '🚀 Join This Game'}
            </button>
          </div>
        )}
      </div>

      {/* Teams Section */}
      {teams.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
            🏆 Teams ({teams.length})
          </h3>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            {teams.map((team, index) => (
              <div 
                key={team.id}
                style={{
                  border: '1px solid #e1e5e9',
                  borderRadius: '8px',
                  padding: '1rem',
                  backgroundColor: 'white'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div 
                      style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: team.teamColor,
                        borderRadius: '50%',
                        border: '1px solid #ddd'
                      }}
                    ></div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{team.teamName}</h4>
                    {team.captain && (
                      <span style={{ fontSize: '0.8rem', color: '#666' }}>
                        👑 {team.captain.username}
                      </span>
                    )}
                  </div>
                  
                  <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                    {team.activePlayersCount} players
                    {team.averageSkillLevel && (
                      <span style={{ color: '#666', marginLeft: '0.5rem' }}>
                        ⭐ {team.averageSkillLevel.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Team Members */}
                {team.members.length > 0 && (
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {team.members.map((member, memberIndex) => (
                      <div 
                        key={member.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.5rem',
                          backgroundColor: member.isSubstitute ? '#fff3cd' : '#f8f9fa',
                          borderRadius: '4px',
                          fontSize: '0.9rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>{member.user.username}</span>
                          {member.assignedPosition && (
                            <span style={{ color: '#666', fontSize: '0.8rem' }}>
                              ({member.assignedPosition})
                            </span>
                          )}
                          {member.isSubstitute && (
                            <span style={{ color: '#856404', fontSize: '0.8rem', fontWeight: '500' }}>
                              SUB
                            </span>
                          )}
                          {member.checkedInAt && (
                            <span style={{ color: '#28a745', fontSize: '0.8rem' }}>✅</span>
                          )}
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span 
                            style={{
                              backgroundColor: getPaymentStatusColor(member.paymentStatus),
                              color: 'white',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '10px',
                              fontSize: '0.7rem',
                              fontWeight: '500'
                            }}
                          >
                            {member.paymentStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Available Spots */}
                {team.activePlayersCount < (game.gameTemplate?.playersPerTeam || 5) && (
                  <div style={{ 
                    marginTop: '0.5rem', 
                    padding: '0.5rem', 
                    backgroundColor: '#e7f3ff', 
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    color: '#0066cc'
                  }}>
                    ➕ Need {(game.gameTemplate?.playersPerTeam || 5) - team.activePlayersCount} more player(s)
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Game Template Info */}
      {game.gameTemplate && (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e1e5e9',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>📋 Game Format</h3>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            <p><strong>Format:</strong> {game.gameTemplate.format} ({game.gameTemplate.playersPerTeam} vs {game.gameTemplate.playersPerTeam})</p>
            <p><strong>Duration:</strong> {game.gameTemplate.durationMinutes} minutes</p>
            {game.gameTemplate.requiredEquipment && (
              <p><strong>Equipment:</strong> {game.gameTemplate.requiredEquipment}</p>
            )}
            {game.gameTemplate.defaultRules && (
              <p><strong>Rules:</strong> {game.gameTemplate.defaultRules}</p>
            )}
          </div>
        </div>
      )}

      {/* Venue Information */}
      {game.venue && (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e1e5e9',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>📍 Venue Details</h3>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            <p><strong>Name:</strong> {game.venue.name}</p>
            <p><strong>Address:</strong> {game.venue.address}</p>
            <p><strong>Type:</strong> {game.venue.venueType}</p>
            {game.venue.amenities && game.venue.amenities.length > 0 && (
              <p><strong>Amenities:</strong> {game.venue.amenities.join(', ')}</p>
            )}
          </div>
        </div>
      )}

      {/* Join Game Section */}
      {canJoinGame && game.gameTemplate?.positions && (
        <div style={{
          backgroundColor: '#f8f9fa',
          border: '1px solid #e1e5e9',
          borderRadius: '8px',
          padding: '1rem'
        }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Join with Position Preference</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {game.gameTemplate.positions.split(',').map((position: string) => (
              <button
                key={position.trim()}
                onClick={() => handleJoinGame(position.trim())}
                disabled={joiningGame}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  border: '1px solid #007bff',
                  backgroundColor: 'white',
                  color: '#007bff',
                  cursor: joiningGame ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  opacity: joiningGame ? 0.7 : 1
                }}
              >
                {position.trim()}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => handleJoinGame()}
            disabled={joiningGame}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              cursor: joiningGame ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              opacity: joiningGame ? 0.7 : 1
            }}
          >
            {joiningGame ? '🔄 Joining...' : '🏃‍♂️ Join Any Position'}
          </button>
        </div>
      )}

      {/* Game Full Message */}
      {!canJoinGame && game.status === 'PUBLISHED' && (
        <div style={{
          backgroundColor: '#fff3cd',
          color: '#856404',
          padding: '1rem',
          borderRadius: '8px',
          textAlign: 'center',
          fontSize: '0.9rem'
        }}>
          ⚠️ This game is currently full. You can join the waitlist for cancellations.
        </div>
      )}
    </div>
  );
}

function getPaymentStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    'PAID': '#28a745',
    'PENDING': '#ffc107', 
    'FAILED': '#dc3545',
    'WAIVED': '#17a2b8',
    'PARTIAL': '#fd7e14'
  };
  return colorMap[status] || '#6c757d';
}