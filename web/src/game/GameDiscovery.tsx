import React, { useState, useEffect } from 'react';
import { GameDetailsDTO, GameSummaryDTO } from '../api';

interface GameDiscoveryProps {
  onGameSelect: (game: GameDetailsDTO) => void;
}

interface DiscoveryFilters {
  sport: string;
  city: string;
  skillLevel: string;
  priceMax: number;
  availableSpotsOnly: boolean;
  timeRange: 'today' | 'week' | 'month';
}

const SPORTS = ['Soccer', 'Basketball', 'Football', 'Volleyball', 'Tennis'];
const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Pro'];
const CITIES = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Austin', 'Seattle', 'San Francisco', 'Atlanta'];

export function GameDiscovery({ onGameSelect }: GameDiscoveryProps) {
  const [games, setGames] = useState<GameSummaryDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<DiscoveryFilters>({
    sport: '',
    city: '',
    skillLevel: '',
    priceMax: 50,
    availableSpotsOnly: true,
    timeRange: 'week'
  });

  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Get user's location for proximity-based discovery
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Location access denied:', error);
        }
      );
    }
  }, []);

  // Load games based on filters
  useEffect(() => {
    loadGames();
  }, [filters, userLocation]);

  const loadGames = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      
      if (filters.sport) params.append('sport', filters.sport);
      if (filters.city) params.append('location', filters.city);
      if (filters.skillLevel) params.append('skillLevel', filters.skillLevel);
      
      // Add proximity search if location available
      if (userLocation) {
        params.append('latitude', userLocation.lat.toString());
        params.append('longitude', userLocation.lng.toString());
        params.append('radius', '25'); // 25km radius
      }
      
      // Time range filter
      const timeRangeHours = {
        today: 24,
        week: 168,
        month: 720
      }[filters.timeRange];
      
      const fromTime = new Date();
      const toTime = new Date(Date.now() + timeRangeHours * 60 * 60 * 1000);
      params.append('fromTime', fromTime.toISOString());
      params.append('toTime', toTime.toISOString());

      const response = await fetch(`/api/games/explore?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load games');
      }

      const data = await response.json();
      
      // Filter by price and availability on client side
      let filteredGames = data.content || [];
      
      if (filters.priceMax > 0) {
        filteredGames = filteredGames.filter((game: any) => 
          !game.pricePerPlayer || game.pricePerPlayer <= filters.priceMax
        );
      }
      
      if (filters.availableSpotsOnly) {
        filteredGames = filteredGames.filter((game: any) => 
          game.participantCount < game.maxPlayers
        );
      }
      
      setGames(filteredGames);
    } catch (err: any) {
      setError(err.message || 'Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof DiscoveryFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleQuickJoin = async (gameId: number) => {
    try {
      const response = await fetch(`/api/games/${gameId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to join game');
      }

      // Refresh games list
      loadGames();
      alert('Successfully joined game! Check your email for team assignment.');
      
    } catch (err: any) {
      alert(err.message || 'Failed to join game');
    }
  };

  const getGameStatusBadge = (game: any) => {
    const spotsTaken = game.participantCount || 0;
    const totalSpots = game.maxPlayers || 10;
    const percentage = (spotsTaken / totalSpots) * 100;
    
    if (percentage >= 100) {
      return <span style={{color: '#FF4444', fontWeight: 'bold'}}>FULL</span>;
    } else if (percentage >= 80) {
      return <span style={{color: '#FF8800', fontWeight: 'bold'}}>FILLING UP</span>;
    } else if (percentage >= 50) {
      return <span style={{color: '#44AA44', fontWeight: 'bold'}}>AVAILABLE</span>;
    } else {
      return <span style={{color: '#4444FF', fontWeight: 'bold'}}>OPEN</span>;
    }
  };

  const formatGameTime = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return `Today ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (hours < 48) {
      return `Tomorrow ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric', 
        minute: '2-digit'
      });
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
        🏆 Discover Games
      </h2>

      {/* Filters Section */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '1rem', 
        borderRadius: '8px', 
        marginBottom: '1.5rem' 
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          {/* Sport Filter */}
          <div>
            <label style={{ fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>Sport</label>
            <select 
              value={filters.sport} 
              onChange={e => handleFilterChange('sport', e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="">All Sports</option>
              {SPORTS.map(sport => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div>
            <label style={{ fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>City</label>
            <select 
              value={filters.city} 
              onChange={e => handleFilterChange('city', e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="">All Cities</option>
              {CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Skill Level Filter */}
          <div>
            <label style={{ fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>Skill Level</label>
            <select 
              value={filters.skillLevel} 
              onChange={e => handleFilterChange('skillLevel', e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="">Any Level</option>
              {SKILL_LEVELS.map(level => (
                <option key={level} value={level.toUpperCase()}>{level}</option>
              ))}
            </select>
          </div>

          {/* Time Range Filter */}
          <div>
            <label style={{ fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>Time Range</label>
            <select 
              value={filters.timeRange} 
              onChange={e => handleFilterChange('timeRange', e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters */}
        <div style={{ marginTop: '1rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div>
            <label style={{ fontWeight: '500', marginRight: '0.5rem' }}>Max Price: ${filters.priceMax}</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={filters.priceMax} 
              onChange={e => handleFilterChange('priceMax', parseInt(e.target.value))}
              style={{ width: '120px' }}
            />
          </div>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type="checkbox" 
              checked={filters.availableSpotsOnly}
              onChange={e => handleFilterChange('availableSpotsOnly', e.target.checked)}
            />
            Available spots only
          </label>
        </div>
      </div>

      {/* Games List */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>🔄 Finding games...</div>
        </div>
      )}

      {error && (
        <div style={{ color: '#FF4444', padding: '1rem', backgroundColor: '#FFF5F5', borderRadius: '8px', marginBottom: '1rem' }}>
          ❌ {error}
        </div>
      )}

      {!loading && !error && games.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <div style={{ fontSize: '3rem' }}>🏃‍♂️</div>
          <h3>No games found</h3>
          <p>Try adjusting your filters or check back later for new games!</p>
        </div>
      )}

      {!loading && games.length > 0 && (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {games.map((game: any) => (
            <div 
              key={game.id} 
              style={{ 
                border: '1px solid #e1e5e9',
                borderRadius: '12px',
                padding: '1.5rem',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
              {/* Game Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>
                    {getSportEmoji(game.sport)} {game.templateName || `${game.sport}`}
                  </h3>
                  <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.9rem' }}>
                    📍 {game.location}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {getGameStatusBadge(game)}
                </div>
              </div>

              {/* Game Details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>Time</div>
                  <div style={{ fontWeight: '500' }}>🕐 {formatGameTime(game.time)}</div>
                </div>
                
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>Players</div>
                  <div style={{ fontWeight: '500' }}>
                    👥 {game.participantCount || 0}/{game.maxPlayers} 
                    {game.gameTemplate && ` (${game.gameTemplate.format})`}
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>Price</div>
                  <div style={{ fontWeight: '500' }}>
                    💰 ${game.pricePerPlayer ? game.pricePerPlayer.toFixed(2) : '0.00'}
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>Level</div>
                  <div style={{ fontWeight: '500' }}>
                    🎯 {game.skillLevel || 'Any'}
                  </div>
                </div>
              </div>

              {/* Team Formation Status */}
              {game.teams && game.teams.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>Teams</div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {game.teams.map((team: any, index: number) => (
                      <div 
                        key={team.id || index}
                        style={{ 
                          backgroundColor: team.teamColor || '#f0f0f0',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: '500'
                        }}
                      >
                        {team.teamName} ({team.activePlayersCount}/{game.gameTemplate?.playersPerTeam || 5})
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => onGameSelect(game)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: '1px solid #007bff',
                    backgroundColor: 'white',
                    color: '#007bff',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  View Details
                </button>
                
                {game.participantCount < game.maxPlayers && (
                  <button 
                    onClick={() => handleQuickJoin(game.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: '#007bff',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}
                  >
                    Quick Join
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Action Cards */}
      {!loading && games.length > 0 && (
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <h3 style={{ color: '#666', fontSize: '1rem' }}>Quick Actions</h3>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {SPORTS.map(sport => (
              <button 
                key={sport}
                onClick={() => handleFilterChange('sport', sport)}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '20px',
                  border: filters.sport === sport ? 'none' : '1px solid #ddd',
                  backgroundColor: filters.sport === sport ? '#007bff' : 'white',
                  color: filters.sport === sport ? 'white' : '#333',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                {getSportEmoji(sport)} {sport}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions
function getSportEmoji(sport: string): string {
  const emojiMap: Record<string, string> = {
    'Soccer': '⚽',
    'Basketball': '🏀',
    'Football': '🏈',
    'Volleyball': '🏐',
    'Tennis': '🎾',
    'Baseball': '⚾',
    'Golf': '⛳'
  };
  return emojiMap[sport] || '🏃‍♂️';
}

function formatGameTime(timeString: string): string {
  const date = new Date(timeString);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (hours < 2) {
    return 'Starting soon';
  } else if (hours < 24) {
    return `Today ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  } else if (hours < 48) {
    return `Tomorrow ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  } else {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric', 
      minute: '2-digit'
    });
  }
}