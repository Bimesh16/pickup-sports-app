import React, { useEffect, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@hooks/useAuth';
const Dashboard = React.lazy(() => import('@pages/Dashboard').then(m => ({ default: m.Dashboard })));
const LoginPage = React.lazy(() => import('@pages/Login'));
const GameDetailsRoute = React.lazy(() => import('@pages/GameDetailsRoute'));
const Register = React.lazy(() => import('@pages/Register'));
const LocationOnboarding = React.lazy(() => import('@pages/LocationOnboarding'));
import EnhancedGameEntranceAuth from '@components/EnhancedGameEntranceAuth';
// Note: UnifiedJoinTheLeague is only imported for dev test route to enable tree-shaking in prod
let UnifiedJoinTheLeague: any = null as any;
if (import.meta.env.DEV) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  UnifiedJoinTheLeague = (await import('@components/UnifiedJoinTheLeague')).default;
}
import ForgotPassword from '@pages/ForgotPassword';
import ForgotUsername from '@pages/ForgotUsername';
import ResetPassword from '@pages/ResetPassword';
import { GlobalStyles } from '@components/ui';
import { LocationProvider } from '@context/LocationContext';
import { theme } from '@styles/theme';
import { http } from '@lib/http';
import { ErrorBoundary } from '@components/ErrorBoundary';

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
  const location = useLocation();

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
      <ErrorBoundary key={location.pathname}>
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={token ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Suspense fallback={<div style={{color:'white', padding: 24}}>Loading…</div>}>
              <LoginPage />
            </Suspense>
          )}
        />
        <Route
          path="/login"
          element={token ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Suspense fallback={<div style={{color:'white', padding: 24}}>Loading…</div>}>
              <LoginPage />
            </Suspense>
          )}
        />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/forgot-username" element={<ForgotUsername />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Test-only route to mount registration flow for e2e (DEV only) */}
        {import.meta.env.DEV && (
          <Route path="/test-registration" element={<UnifiedJoinTheLeague />} />
        )}
        <Route
          path="/register"
          element={token ? <Navigate to="/dashboard" replace /> : (
            <Suspense fallback={<div style={{color:'white', padding: 24}}>Loading…</div>}>
              <Register />
            </Suspense>
          )}
        />
        <Route
          path="/onboarding/location"
          element={token ? (
            <Suspense fallback={<div style={{color:'white', padding: 24}}>Loading…</div>}>
              <LocationOnboarding />
            </Suspense>
          ) : <Navigate to="/login" replace state={{ from: location }} />}
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={token ? (
            <Suspense fallback={<div style={{color:'white', padding: 24}}>Loading…</div>}>
              <Dashboard />
            </Suspense>
          ) : <Navigate to="/login" replace state={{ from: location }} />}
        />
        <Route
          path="/games/:id"
          element={token ? (
            <Suspense fallback={<div style={{color:'white', padding: 24}}>Loading…</div>}>
              <GameDetailsRoute />
            </Suspense>
          ) : <Navigate to="/login" replace state={{ from: location }} />}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
      </Routes>
      </ErrorBoundary>
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
          <LocationProvider>
            <AppInner />
          </LocationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </>
  );
}

function EnvBadge() {
  const [env, setEnv] = React.useState<string>('');
  React.useEffect(() => {
    // Use http helper so mock handles this in dev; avoid dev-proxy noise
    http<{ env?: string }>('/config/flags')
      .then(d => setEnv(d.env ?? 'mock'))
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
