import React, { useEffect, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@hooks/useAuth';
const Dashboard = React.lazy(() => import('@pages/Dashboard'));
const LoginPage = React.lazy(() => import('@pages/Login'));
const GameDetailsRoute = React.lazy(() => import('@pages/GameDetailsRoute'));
const CreateGameRoute = React.lazy(() => import('@pages/dashboard/CreateGame'));
const EditGameRoute = React.lazy(() => import('@pages/dashboard/EditGame'));
const Register = React.lazy(() => import('@pages/Register'));
const LocationOnboarding = React.lazy(() => import('@pages/LocationOnboarding'));
const PremiumTabsDemo = React.lazy(() => import('@pages/PremiumTabsDemo'));
const ProfileHub = React.lazy(() => import('@pages/ProfileHub'));
const NotificationsMatrix = React.lazy(() => import('@pages/NotificationsMatrix'));
const SettingsAdvanced = React.lazy(() => import('@pages/SettingsAdvanced'));
const UnifiedComponentsDemo = React.lazy(() => import('@pages/UnifiedComponentsDemo'));
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
import TrustBar from '@components/TrustBar';
import NotificationBanner from '@components/NotificationBanner';
import OfflineIndicator from '@components/OfflineIndicator';
import { LocationProvider } from '@context/LocationContext';
import { ThemeProvider } from '@context/ThemeContext';
import { AppStateProvider } from '@context/AppStateContext';
import { StompWebSocketProvider } from '@context/StompWebSocketContext';
import WebSocketErrorBoundary from '@components/WebSocketErrorBoundary';
import { pushNotificationService } from './services/pushNotificationService';
import { offlineCacheService } from './services/offlineCacheService';
import './utils/mockWebSocket'; // Import mock WebSocket for development
import { theme } from '@styles/theme';
import { http } from '@lib/http';
import ErrorBoundary from '@components/ErrorBoundary';

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

  // Initialize services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Initialize offline cache service
        await offlineCacheService.initialize();
        console.log('Offline cache service initialized');

        // Initialize push notifications
        try {
          const pushInitialized = await pushNotificationService.initialize();
          if (pushInitialized) {
            console.log('Push notifications initialized');
          } else {
            console.log('Push notifications not available (permission denied or not supported)');
          }
        } catch (error) {
          console.warn('Push notification initialization failed:', error);
        }

        // Set up online/offline listeners
        const cleanup = offlineCacheService.onOnlineStatusChange((isOnline: boolean) => {
          console.log('Network status changed:', isOnline ? 'online' : 'offline');
        });

        return cleanup;
      } catch (error) {
        console.error('Failed to initialize services:', error);
      }
    };

    const cleanup = initializeServices();
    
    return () => {
      cleanup.then(cleanupFn => cleanupFn?.());
    };
  }, []);

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
        <Route
          path="/tabs-demo"
          element={token ? (
            <Suspense fallback={<div style={{color:'white', padding: 24}}>Loading…</div>}>
              <PremiumTabsDemo />
            </Suspense>
          ) : <Navigate to="/login" replace state={{ from: location }} />}
        />
        <Route
          path="/profile-hub"
          element={token ? (
            <Suspense fallback={<div style={{color:'white', padding: 24}}>Loading…</div>}>
              <ProfileHub />
            </Suspense>
          ) : <Navigate to="/login" replace state={{ from: location }} />}
        />
        <Route
          path="/profile"
          element={token ? (
            <Suspense fallback={<div style={{color:'white', padding: 24}}>Loading…</div>}>
              <ProfileHub />
            </Suspense>
          ) : <Navigate to="/login" replace state={{ from: location }} />}
        />
        <Route
          path="/notifications-matrix"
          element={token ? (
            <Suspense fallback={<div style={{color:'white', padding: 24}}>Loading…</div>}>
              <NotificationsMatrix />
            </Suspense>
          ) : <Navigate to="/login" replace state={{ from: location }} />}
        />
        <Route
          path="/settings-advanced"
          element={token ? (
            <Suspense fallback={<div style={{color:'white', padding: 24}}>Loading…</div>}>
              <SettingsAdvanced />
            </Suspense>
          ) : <Navigate to="/login" replace state={{ from: location }} />}
        />
        <Route
          path="/unified-demo"
          element={token ? (
            <Suspense fallback={<div style={{color:'white', padding: 24}}>Loading…</div>}>
              <UnifiedComponentsDemo />
            </Suspense>
          ) : <Navigate to="/login" replace state={{ from: location }} />}
        />

        {/* Protected routes */}
        <Route
          path="/dashboard/*"
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
        <Route
          path="/games/new"
          element={token ? (
            <Suspense fallback={<div style={{color:'white', padding: 24}}>Loading…</div>}>
              <CreateGameRoute />
            </Suspense>
          ) : <Navigate to="/login" replace state={{ from: location }} />}
        />
        <Route
          path="/games/:id/edit"
          element={token ? (
            <Suspense fallback={<div style={{color:'white', padding: 24}}>Loading…</div>}>
              <EditGameRoute />
            </Suspense>
          ) : <Navigate to="/login" replace state={{ from: location }} />}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
      </Routes>
      </ErrorBoundary>
      <EnvBadge />
      <OfflineIndicator />
      <NotificationBanner onDismiss={(id) => {
        console.log('Dismissed notification:', id);
        // You can add additional logic here if needed
      }} />
      <TrustBar />
    </div>
  );
}

export default function App() {
  return (
    <>
      <GlobalStyles />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <AppStateProvider>
              <LocationProvider>
        <WebSocketErrorBoundary>
          <StompWebSocketProvider>
            <AppInner />
          </StompWebSocketProvider>
        </WebSocketErrorBoundary>
              </LocationProvider>
            </AppStateProvider>
          </ThemeProvider>
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
