import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { nearbyGames, trendingGames } from '@api/games';
import { GameCard } from '@components/GameCard';
import { Button, Card, Input, Badge } from '@components/ui';
import { useAuth } from '@hooks/useAuth';
import { theme } from '@styles/theme';
import { NEPAL_LOCATIONS, SKILL_LEVELS, POPULAR_SPORTS_NEPAL } from '@constants/nepal';

export function NearbyGames() {
  const { logout } = useAuth();
  const [lat, setLat] = React.useState<number | ''>('');
  const [lon, setLon] = React.useState<number | ''>('');
  const [radius, setRadius] = React.useState<number>(5);
  const [sport, setSport] = React.useState<string>('');
  const [skillLevel, setSkillLevel] = React.useState<string>('');

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setLat(Number(pos.coords.latitude.toFixed(5)));
          setLon(Number(pos.coords.longitude.toFixed(5)));
        },
        () => {
          // Default to Kathmandu if geolocation fails
          setLat(27.7172);
          setLon(85.3240);
        }
      );
    } else {
      // Default to Kathmandu if geolocation not available
      setLat(27.7172);
      setLon(85.3240);
    }
  }, []);

  const canSearch = lat !== '' && lon !== '';

  const qNearby = useQuery({
    queryKey: ['nearby', lat, lon, radius, sport, skillLevel],
    queryFn: () => nearbyGames({ 
      latitude: lat as number, 
      longitude: lon as number, 
      radiusKm: radius,
      sport: sport || undefined,
      skillLevel: skillLevel || undefined
    }),
    enabled: canSearch,
  });

  const qTrending = useQuery({
    queryKey: ['trending', lat, lon],
    queryFn: () => trendingGames(lat === '' || lon === '' ? undefined : { latitude: lat as number, longitude: lon as number }),
    enabled: !canSearch,
  });

  const games = canSearch ? (qNearby.data ?? []) : (qTrending.data ?? []);
  const loading = canSearch ? qNearby.isLoading : qTrending.isLoading;

  const sports = ['Soccer', 'Basketball', 'Tennis', 'Futsal', 'Volleyball'];
  const skillLevels = ['Beginner', 'Intermediate', 'Advanced'];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 24,
        padding: '16px 0',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div>
          <h1 style={{ 
            fontSize: 24, 
            fontWeight: '700', 
            color: '#1f2937', 
            margin: '0 0 4px 0' 
          }}>
            {canSearch ? 'Nearby Games' : 'Trending Games'}
          </h1>
          <p style={{ 
            fontSize: 14, 
            color: '#6b7280', 
            margin: 0 
          }}>
            {canSearch 
              ? `Showing games within ${radius}km of your location`
              : 'Popular games in your area'
            }
          </p>
        </div>
        <button
          onClick={logout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease-in-out'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
        >
          Logout
        </button>
      </div>

      {/* Search Controls */}
      <div style={{ 
        backgroundColor: '#f9fafb',
        padding: 20,
        borderRadius: 12,
        marginBottom: 24,
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ 
          fontSize: 16, 
          fontWeight: '600', 
          color: '#374151', 
          margin: '0 0 16px 0' 
        }}>
          Search Filters
        </h3>
        
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: 14, 
              fontWeight: '500', 
              color: '#374151', 
              marginBottom: 6 
            }}>
              Latitude
            </label>
            <input 
              value={lat} 
              onChange={e => setLat(e.target.value === '' ? '' : Number(e.target.value))} 
              placeholder="27.7172" 
              style={{ 
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: 14, 
              fontWeight: '500', 
              color: '#374151', 
              marginBottom: 6 
            }}>
              Longitude
            </label>
            <input 
              value={lon} 
              onChange={e => setLon(e.target.value === '' ? '' : Number(e.target.value))} 
              placeholder="85.3240" 
              style={{ 
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: 14, 
              fontWeight: '500', 
              color: '#374151', 
              marginBottom: 6 
            }}>
              Radius (km)
            </label>
            <input 
              value={radius} 
              onChange={e => setRadius(Number(e.target.value))} 
              type="number" 
              min={1} 
              max={50} 
              style={{ 
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: 14, 
              fontWeight: '500', 
              color: '#374151', 
              marginBottom: 6 
            }}>
              Sport
            </label>
            <select 
              value={sport} 
              onChange={e => setSport(e.target.value)}
              style={{ 
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="">All Sports</option>
              {sports.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: 14, 
              fontWeight: '500', 
              color: '#374151', 
              marginBottom: 6 
            }}>
              Skill Level
            </label>
            <select 
              value={skillLevel} 
              onChange={e => setSkillLevel(e.target.value)}
              style={{ 
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="">All Levels</option>
              {skillLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
          <button 
            onClick={() => { if (canSearch) qNearby.refetch(); else qTrending.refetch(); }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
          >
            🔄 Refresh
          </button>
          
          <button 
            onClick={() => {
              setSport('');
              setSkillLevel('');
              if (canSearch) qNearby.refetch();
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6b7280',
              color: '#ffffff',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
          >
            🧹 Clear Filters
          </button>
        </div>
      </div>

      {/* Games List */}
      {loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px',
          color: '#6b7280',
          fontSize: 16
        }}>
          🔄 Loading games...
        </div>
      )}
      
      {!loading && games.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px',
          color: '#6b7280',
          fontSize: 16
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏃‍♂️</div>
          <div>No games found matching your criteria.</div>
          <div style={{ fontSize: 14, marginTop: 8 }}>
            Try adjusting your search filters or location.
          </div>
        </div>
      )}
      
      {!loading && games.length > 0 && (
        <div style={{ 
          display: 'grid', 
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))'
        }}>
          {games.map(g => <GameCard key={g.id} g={g} />)}
        </div>
      )}
    </div>
  );
}

