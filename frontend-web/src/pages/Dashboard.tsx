import React from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useAppState } from "@context/AppStateContext";
import { useSystemDarkMode } from "@hooks/useSystemDarkMode";
import { Button, Card, Badge } from "@components/ui";
import OfflineIndicator from "@components/OfflineIndicator";
import TrustBar from "@components/TrustBar";
import NotificationBell from "@components/NotificationBell";
import { 
  Gamepad2, 
  MapPin, 
  Bell, 
  Plus, 
  Sun, 
  Moon,
  Home,
  Settings,
  User,
  CreditCard,
  Receipt
} from "lucide-react";
import { mockDashboardApi } from "./dashboard/mockData";

import HomePage from "./dashboard/HomePage";
import GamesPage from "./dashboard/GamesPage";
import VenuesPage from "./dashboard/VenuesPage";
import ProfilePage from "./dashboard/ProfilePage";
import SettingsPage from "./dashboard/SettingsPage";
import NotificationsPage from "./dashboard/NotificationsPage";
import PaymentDemo from "./dashboard/PaymentDemo";
import PaymentHistoryPage from "./dashboard/PaymentHistory";
import PaymentNotifications from "./dashboard/PaymentNotifications";
import { PaymentAnalytics } from "../components/payments/PaymentAnalytics";

export const mockApi = {
  getGames: mockDashboardApi.getGames.bind(mockDashboardApi),
  getVenues: mockDashboardApi.getVenues.bind(mockDashboardApi),
  getNotifications: mockDashboardApi.getNotifications.bind(mockDashboardApi),
  getRecommendations: mockDashboardApi.getRecommendations.bind(mockDashboardApi),
};

// Navigation tabs component
function NavigationTabs() {
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications } = useAppState();
  
  const unreadNotifications = notifications.filter(n => !n.isRead).length;
  
  const tabs = [
    { id: '', label: 'Home', icon: Home, path: '' },
    { id: 'games', label: 'Games', icon: Gamepad2, path: 'games' },
    { id: 'venues', label: 'Venues', icon: MapPin, path: 'venues' },
    { id: 'payments', label: 'Payments', icon: CreditCard, path: 'payment-demo' },
    { id: 'profile', label: 'Profile', icon: User, path: 'profile' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: 'notifications', badge: unreadNotifications },
    { id: 'settings', label: 'Settings', icon: Settings, path: 'settings' },
  ];

  const currentPath = location.pathname.split('/').pop() || '';
  
  return (
    <>
      {/* Beautiful Top Navigation - All Devices */}
      <div className="bg-gradient-to-r from-[var(--bg-surface)] via-[var(--bg-surface)] to-[var(--bg-surface)] border-b border-[var(--border)] sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = currentPath === tab.path;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(`/dashboard/${tab.path}`)}
                  className={`group relative flex items-center gap-3 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-300 min-w-fit ${
                    isActive
                      ? 'text-[var(--brand-primary)] transform scale-105'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:transform hover:scale-102'
                  }`}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] rounded-full animate-pulse" />
                  )}
                  
                  {/* Hover Glow Effect */}
                  <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r from-[var(--brand-primary)]/10 to-[var(--brand-secondary)]/10' 
                      : 'bg-transparent group-hover:bg-[var(--bg-muted)]/50'
                  }`} />
                  
                  <div className="relative flex items-center gap-3">
                    <div className="relative">
                      <IconComponent className={`w-5 h-5 transition-all duration-300 ${
                        isActive ? 'animate-bounce' : 'group-hover:scale-110'
                      }`} />
                      {tab.badge && tab.badge > 0 && (
                        <div className="absolute -top-2 -right-2 min-w-[18px] h-[18px] text-xs flex items-center justify-center animate-pulse">
                          <Badge variant="error" size="sm">
                            {tab.badge > 99 ? '99+' : tab.badge}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <span className={`transition-all duration-300 ${
                      isActive ? 'font-semibold' : 'font-medium'
                    }`}>
                      {tab.label}
                    </span>
                  </div>
                  
                  {/* Sparkle Effect for Active Tab */}
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--brand-primary)] rounded-full animate-ping opacity-75" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Beautiful Gradient Border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--brand-primary)]/30 to-transparent" />
      </div>
    </>
  );
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, notifications } = useAppState();
  const { theme, toggleTheme, isDark, getThemeDisplayName } = useSystemDarkMode();
  const [isCreateGameOpen, setIsCreateGameOpen] = React.useState(false);
  const location = useLocation();
  
  // Handle create game completion
  const handleCreateGame = async (gameData: any) => {
    console.log('Creating game:', gameData);
    // Here you would call your backend API to create the game
    // using your existing gamesApi.createGame() function
    alert(`Game created: ${gameData.sport} at ${gameData.location?.venue}`);
    setIsCreateGameOpen(false);
  };

  const greetingName = profile?.firstName ? ', ' + profile.firstName : '';
  const unreadNotifications = notifications.filter(n => !n.isRead).length;
  
  // Check if we're on the home page
  const isHomePage = location.pathname === '/dashboard' || location.pathname === '/dashboard/';

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] font-[var(--font-sans)]">
      {/* Header - Only show on home page */}
      {isHomePage && (
        <header className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-r from-[var(--brand-secondary)] via-[var(--brand-primary)] to-[var(--brand-accent)] p-8 text-white shadow-xl mx-4 mt-4">
          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium uppercase tracking-wider opacity-90">Pickup Sports</p>
              </div>
              <h1 className="text-3xl font-bold mb-2">Welcome back{greetingName}</h1>
              <p className="text-white/80 max-w-md">
                Plan matches, discover venues, and keep your crew organized in one spot.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <NotificationBell 
                size="md" 
                variant="outline" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              />
              
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                leftIcon={isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              >
                {getThemeDisplayName()}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateGameOpen(true)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Create Game
              </Button>
            </div>
          </div>

          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}
            ></div>
          </div>
        </header>
      )}

      {/* Navigation Tabs - Always visible */}
      <div className={`${!isHomePage ? 'mt-4' : ''}`}>
        <NavigationTabs />
      </div>

      {/* Quick Stats - Only show on home page */}
      {isHomePage && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mx-4 mb-6 mt-6">
          <Card elevated className="bg-gradient-to-br from-[var(--success-light)] to-[var(--success-light)]/50 border-[var(--success)]/20">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-[var(--success)]">Games Played</p>
                <p className="text-2xl font-bold text-[var(--success)]">24</p>
              </div>
              <Gamepad2 className="w-8 h-8 text-[var(--success)]/60" />
            </div>
          </Card>

          <Card elevated className="bg-gradient-to-br from-[var(--info-light)] to-[var(--info-light)]/50 border-[var(--info)]/20">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-[var(--info)]">Venues Visited</p>
                <p className="text-2xl font-bold text-[var(--info)]">8</p>
              </div>
              <MapPin className="w-8 h-8 text-[var(--info)]/60" />
            </div>
          </Card>

          <Card elevated className="bg-gradient-to-br from-[var(--warning-light)] to-[var(--warning-light)]/50 border-[var(--warning)]/20">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-[var(--warning)]">Upcoming</p>
                <p className="text-2xl font-bold text-[var(--warning)]">3</p>
              </div>
              <Bell className="w-8 h-8 text-[var(--warning)]/60" />
            </div>
          </Card>

          <Card elevated className="bg-gradient-to-br from-[var(--brand-primary)]/10 to-[var(--brand-primary)]/5 border-[var(--brand-primary)]/20">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-[var(--brand-primary)]">Alerts</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-[var(--brand-primary)]">{unreadNotifications}</p>
                  {unreadNotifications > 0 && (
                    <Badge variant="error" size="sm">New</Badge>
                  )}
                </div>
              </div>
              <Bell className="w-8 h-8 text-[var(--brand-primary)]/60" />
            </div>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 px-4 pb-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Trust Bar */}
      <TrustBar />

      {/* Offline Indicator */}
      <OfflineIndicator showBadge={true} enableAutoSync={true} />
    </div>
  );
}

export default function Dashboard() {
  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="games" element={<GamesPage />} />
        <Route path="venues" element={<VenuesPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="payment-demo" element={<PaymentDemo />} />
        <Route path="payment-history" element={<PaymentHistoryPage />} />
        <Route path="payment-notifications" element={<PaymentNotifications />} />
        <Route path="payment-analytics" element={<PaymentAnalytics />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
