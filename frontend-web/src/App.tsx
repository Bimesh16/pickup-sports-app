import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { NearbyGames } from './pages/NearbyGames';
import { Login } from './pages/Login';

function AppInner() {
  const { token, tryLoad } = useAuth();

  useEffect(() => { tryLoad(); }, [tryLoad]);

  return (
    <div style={{ 
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial', 
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      {!token && (
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <Login />
        </div>
      )}
      
      {token && (
        <div style={{ minHeight: '100vh' }}>
          <NearbyGames />
        </div>
      )}
      
      <EnvBadge />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

function EnvBadge() {
  const [env, setEnv] = React.useState<string>('');
  React.useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE ?? ''}/config/flags`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setEnv(d.env ?? ''))
      .catch(() => setEnv('mock'));
  }, []);
  return (
    <div style={{ 
      position: 'fixed',
      top: 16,
      right: 16,
      padding: '4px 8px',
      backgroundColor: env === 'mock' ? '#f59e0b' : '#22c55e',
      color: '#ffffff',
      fontSize: 12,
      fontWeight: '500',
      borderRadius: 4,
      zIndex: 1000
    }}>
      {env ? `ENV: ${env.toUpperCase()}` : 'ENV: UNKNOWN'}
    </div>
  );
}
