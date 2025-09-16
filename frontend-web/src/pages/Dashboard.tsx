import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAppState } from "@context/AppStateContext";
import { useSystemDarkMode } from "@hooks/useSystemDarkMode";
import { Button, Card, Badge } from "@components/ui";
import OfflineIndicator from "@components/OfflineIndicator";
import { 
  Gamepad2, 
  MapPin, 
  Bell, 
  Plus, 
  Sun, 
  Moon
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
  const [isCreateGameOpen, setIsCreateGameOpen] = React.useState(false);

  const greetingName = profile?.firstName ? ', ' + profile.firstName : '';
  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] font-[var(--font-sans)]">
      {/* Header */}
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

      {/* Quick Stats */}
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

      {/* Main Content */}
      <main className="flex-1 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

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
