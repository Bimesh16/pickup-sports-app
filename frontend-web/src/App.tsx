import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@hooks/useAuth';
import { Dashboard } from '@pages/Dashboard';
import EnhancedGameEntranceAuth from '@components/EnhancedGameEntranceAuth';
import { GlobalStyles } from '@components/ui';
import { theme } from '@styles/theme';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function AppInner() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: theme.gradients.mountain
      }}>
        <div style={{
          color: 'white',
          fontSize: '18px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(255,255,255,0.3)',
            borderTopColor: 'white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      fontFamily: theme.fonts.primary, 
      minHeight: '100vh',
      backgroundColor: theme.colors.background
    }}>
      {!token ? <EnhancedGameEntranceAuth /> : <Dashboard />}
      <EnvBadge />
    </div>
  );
}

export default function App() {
  return (
    <>
      <GlobalStyles />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppInner />
        </AuthProvider>
      </QueryClientProvider>
    </>
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
