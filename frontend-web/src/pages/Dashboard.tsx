import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAppState } from "@context/AppStateContext";
import { useSystemDarkMode } from "@hooks/useSystemDarkMode";
import { useMobileGestures } from "@hooks/useMobileGestures";
import { useKeyboardHandler } from "@hooks/useKeyboardHandler";
import { Button, Card, Badge } from "@components/ui";
import MobileNavigation from "@components/MobileNavigation";
import MobileBottomSheet from "@components/MobileBottomSheet";
import MobileDrawer from "@components/MobileDrawer";
import OfflineIndicator from "@components/OfflineIndicator";
import { 
  Home,
  Gamepad2, 
  MapPin, 
  User, 
  Bell, 
  Settings, 
  Plus, 
  Sun, 
  Moon, 
  Search,
  Filter,
  Menu
} from "lucide-react";
import { mockDashboardApi } from "./dashboard/mockData";

import HomePage from "./dashboard/HomePage";
import GamesPage from "./dashboard/GamesPage";
import VenuesPage from "./dashboard/VenuesPage";
import ProfilePage from "./dashboard/ProfilePage";
import SettingsPage from "./dashboard/SettingsPage";
import NotificationsPage from "./dashboard/NotificationsPage";

export const mockApi = {
  getGames: mockDashboardApi.getGames.bind(mockDashboardApi),
  getVenues: mockDashboardApi.getVenues.bind(mockDashboardApi),
  getNotifications: mockDashboardApi.getNotifications.bind(mockDashboardApi),
  getRecommendations: mockDashboardApi.getRecommendations.bind(mockDashboardApi),
};

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, notifications } = useAppState();
  const { theme, toggleTheme, isDark, getThemeDisplayName } = useSystemDarkMode();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isCreateGameOpen, setIsCreateGameOpen] = React.useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);
  
  const greetingName = profile?.firstName ? ', ' + profile.firstName : '';
  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  // Mobile gestures
  useMobileGestures({}, () => {
    // Refresh data when pull-to-refresh
    window.location.reload();
  });

  // Keyboard handling
  useKeyboardHandler();

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] font-[var(--font-sans)]">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 bg-[var(--bg-surface)] border-b border-[var(--border)] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--brand-primary)] rounded-lg flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Pickup Sports</h1>
              <p className="text-xs text-[var(--text-muted)]">Welcome back{greetingName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-[var(--bg-muted)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-lg bg-[var(--bg-muted)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:block relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-r from-[var(--brand-secondary)] via-[var(--brand-primary)] to-[var(--brand-accent)] p-8 text-white shadow-xl mx-4 mt-4">
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

      {/* Quick Stats - Mobile */}
      <div className="md:hidden px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          <Card elevated className="bg-gradient-to-br from-[var(--success-light)] to-[var(--success-light)]/50 border-[var(--success)]/20">
            <div className="flex items-center justify-between p-3">
              <div>
                <p className="text-xs font-medium text-[var(--success)]">Games</p>
                <p className="text-lg font-bold text-[var(--success)]">24</p>
              </div>
              <Gamepad2 className="w-6 h-6 text-[var(--success)]/60" />
            </div>
          </Card>
          
          <Card elevated className="bg-gradient-to-br from-[var(--info-light)] to-[var(--info-light)]/50 border-[var(--info)]/20">
            <div className="flex items-center justify-between p-3">
              <div>
                <p className="text-xs font-medium text-[var(--info)]">Venues</p>
                <p className="text-lg font-bold text-[var(--info)]">8</p>
              </div>
              <MapPin className="w-6 h-6 text-[var(--info)]/60" />
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Stats - Desktop */}
      <div className="hidden md:grid md:grid-cols-4 gap-4 mx-4 mb-6">
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

      {/* Main Content */}
      <main className="flex-1 px-4 pb-20 md:px-8 md:pb-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Mobile Menu Drawer */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="Menu"
        side="right"
        size="sm"
      >
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-muted)]">
            <div className="w-10 h-10 bg-[var(--brand-primary)] rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-[var(--text)]">{profile?.firstName} {profile?.lastName}</p>
              <p className="text-sm text-[var(--text-muted)]">{profile?.email}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--bg-hover)] transition-colors touch-manipulation min-h-[44px]">
              <Settings className="w-5 h-5 text-[var(--text-muted)]" />
              <span className="text-[var(--text)]">Settings</span>
            </button>
            
            <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--bg-hover)] transition-colors touch-manipulation min-h-[44px]">
              <Bell className="w-5 h-5 text-[var(--text-muted)]" />
              <span className="text-[var(--text)]">Notifications</span>
              {unreadNotifications > 0 && (
                <Badge variant="error" size="sm">{unreadNotifications}</Badge>
              )}
            </button>
          </div>
        </div>
      </MobileDrawer>

      {/* Create Game Bottom Sheet */}
      <MobileBottomSheet
        isOpen={isCreateGameOpen}
        onClose={() => setIsCreateGameOpen(false)}
        title="Create Game"
        snapPoints={[0.5, 0.8, 0.95]}
        defaultSnapPoint={0.8}
      >
        <div className="p-4">
          <p className="text-[var(--text-muted)] text-center">
            Create game form would go here
          </p>
        </div>
      </MobileBottomSheet>

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
        <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
