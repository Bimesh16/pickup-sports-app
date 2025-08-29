import React, { FormEvent, useEffect, useState } from 'react'
import {
  FeatureFlags,
  GamesPage,
  GameDetailsDTO,
  getFlags,
  getGames,
  login,
  createGame,
  setAuthToken,
  joinGame
} from './api'
import AdminPanel from './AdminPanel'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { LoginForm } from './auth/LoginForm'
import { GameDiscovery } from './game/GameDiscovery'
import { GameDetails } from './game/GameDetails'

// Constants
const SPORTS = ['Soccer', 'Basketball', 'Football', 'Volleyball', 'Tennis'];
const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Pro'];

function AppContent() {
  const [flags, setFlags] = useState<FeatureFlags | null>(null)
  const [games, setGames] = useState<GamesPage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedGame, setSelectedGame] = useState<GameDetailsDTO | null>(null)
  const [currentView, setCurrentView] = useState<'discovery' | 'details' | 'create'>('discovery')

  const [newGame, setNewGame] = useState({
    sport: '',
    location: '',
    time: '',
    skillLevel: '',
  })

  const handleGameCreated = () => {
    setCurrentView('discovery');
    setNewGame({ sport: '', location: '', time: '', skillLevel: '' });
    setError(null);
  };

  useEffect(() => {
    ;(async () => {
      try {
        const f = await getFlags()
        setFlags(f)
        const g = await getGames()
        setGames(g)
      } catch (e: any) {
        setError(e.message ?? 'Error')
      }
    })()
  }, [token])

  useEffect(() => {
    setAuthToken(token)
  }, [token])

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const pair = await login(username, password)
      localStorage.setItem('accessToken', pair.accessToken)
      setToken(pair.accessToken)
      setUsername('')
      setPassword('')
      setError(null)
    } catch (err: any) {
      setError(err.message ?? 'Login failed')
    }
  }

  const handleCreateGame = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    
    try {
      await createGame({
        sport: newGame.sport,
        location: newGame.location,
        time: newGame.time,
        skillLevel: newGame.skillLevel || undefined,
      })
      
      alert('Game created successfully! It will appear in the discovery feed.')
      handleGameCreated()
    } catch (err: any) {
      setError(err.message ?? 'Create game failed')
    }
  }



  const { isAuthenticated, isLoading, user, logout } = useAuth()

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
  }

  if (!isAuthenticated) {
    return <LoginForm />
  }

  const handleGameSelect = (game: GameDetailsDTO) => {
    setSelectedGame(game);
    setCurrentView('details');
  };

  const handleBackToDiscovery = () => {
    setCurrentView('discovery');
    setSelectedGame(null);
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      fontFamily: 'system-ui, -apple-system, Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'white',
        borderBottom: '1px solid #e1e5e9',
        padding: '1rem',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#007bff' }}>
              🏃‍♂️ Pickup Sports
            </h1>
            {currentView !== 'discovery' && (
              <button 
                onClick={handleBackToDiscovery}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#007bff',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                ← Back to Games
              </button>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#666' }}>
              Welcome, {user?.username}!
            </span>
            <button 
              onClick={logout}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: '1px solid #dc3545',
                backgroundColor: 'white',
                color: '#dc3545',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e1e5e9',
        padding: '0 1rem'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '2rem' }}>
          <button
            onClick={() => setCurrentView('discovery')}
            style={{
              background: 'none',
              border: 'none',
              padding: '1rem 0',
              borderBottom: currentView === 'discovery' ? '2px solid #007bff' : '2px solid transparent',
              color: currentView === 'discovery' ? '#007bff' : '#666',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: currentView === 'discovery' ? '500' : 'normal'
            }}
          >
            🔍 Discover Games
          </button>
          <button
            onClick={() => setCurrentView('create')}
            style={{
              background: 'none',
              border: 'none',
              padding: '1rem 0',
              borderBottom: currentView === 'create' ? '2px solid #007bff' : '2px solid transparent',
              color: currentView === 'create' ? '#007bff' : '#666',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: currentView === 'create' ? '500' : 'normal'
            }}
          >
            ➕ Create Game
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '1rem' }}>
        {currentView === 'discovery' && (
          <GameDiscovery onGameSelect={handleGameSelect} />
        )}
        
        {currentView === 'details' && selectedGame && (
          <GameDetails 
            gameId={selectedGame.id} 
            onBack={handleBackToDiscovery}
          />
        )}
        
        {currentView === 'create' && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{
              backgroundColor: 'white',
              border: '1px solid #e1e5e9',
              borderRadius: '12px',
              padding: '2rem'
            }}>
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Create New Game</h2>
              
              <form onSubmit={handleCreateGame}>
                <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Sport
                    </label>
                    <select
                      value={newGame.sport}
                      onChange={e => setNewGame({ ...newGame, sport: e.target.value })}
                      style={{ 
                        width: '100%', 
                        padding: '0.75rem', 
                        borderRadius: '6px', 
                        border: '1px solid #ddd',
                        fontSize: '1rem'
                      }}
                      required
                    >
                      <option value="">Select a sport</option>
                      {SPORTS.map(sport => (
                        <option key={sport} value={sport}>{sport}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Location
                    </label>
                    <input
                      placeholder="e.g., Central Park, New York"
                      value={newGame.location}
                      onChange={e => setNewGame({ ...newGame, location: e.target.value })}
                      style={{ 
                        width: '100%', 
                        padding: '0.75rem', 
                        borderRadius: '6px', 
                        border: '1px solid #ddd',
                        fontSize: '1rem'
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={newGame.time}
                      onChange={e => setNewGame({ ...newGame, time: e.target.value })}
                      style={{ 
                        width: '100%', 
                        padding: '0.75rem', 
                        borderRadius: '6px', 
                        border: '1px solid #ddd',
                        fontSize: '1rem'
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Skill Level
                    </label>
                    <select
                      value={newGame.skillLevel}
                      onChange={e => setNewGame({ ...newGame, skillLevel: e.target.value })}
                      style={{ 
                        width: '100%', 
                        padding: '0.75rem', 
                        borderRadius: '6px', 
                        border: '1px solid #ddd',
                        fontSize: '1rem'
                      }}
                    >
                      <option value="">Any skill level</option>
                      {SKILL_LEVELS.map(level => (
                        <option key={level} value={level.toUpperCase()}>{level}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  🚀 Create Game
                </button>
              </form>

              {error && (
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '1rem', 
                  backgroundColor: '#fff5f5', 
                  color: '#dc3545',
                  borderRadius: '6px',
                  fontSize: '0.9rem'
                }}>
                  ❌ {error}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Admin Panel for development */}
      {user?.role === 'ADMIN' && <AdminPanel />}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
