import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Gamepad2, 
  MapPin, 
  User, 
  Bell, 
  Settings,
  Plus
} from 'lucide-react';
import { cn } from '@lib/utils';

interface MobileNavigationProps {
  className?: string;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ className }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    {
      id: 'home',
      path: '/dashboard',
      icon: Home,
      label: 'Home',
      testId: 'nav-home'
    },
    {
      id: 'games',
      path: '/dashboard/games',
      icon: Gamepad2,
      label: 'Games',
      testId: 'nav-games'
    },
    {
      id: 'venues',
      path: '/dashboard/venues',
      icon: MapPin,
      label: 'Venues',
      testId: 'nav-venues'
    },
    {
      id: 'profile',
      path: '/dashboard/profile',
      icon: User,
      label: 'Profile',
      testId: 'nav-profile'
    },
    {
      id: 'notifications',
      path: '/dashboard/notifications',
      icon: Bell,
      label: 'Alerts',
      testId: 'nav-notifications'
    }
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const handleTabClick = (path: string) => {
    navigate(path);
  };

  const handleCreateGame = () => {
    navigate('/dashboard/games?action=create');
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-surface)] border-t border-[var(--border)] safe-area-pb">
        <div className="flex items-center justify-around h-16 px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.path)}
                data-testid={tab.testId}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 py-1 rounded-lg transition-colors",
                  "touch-manipulation", // Optimize for touch
                  active
                    ? "text-[var(--brand-primary)] bg-[var(--brand-primary)]/10"
                    : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-hover)]"
                )}
                aria-label={tab.label}
              >
                <Icon 
                  className={cn(
                    "w-5 h-5 mb-0.5",
                    active && "scale-110"
                  )} 
                />
                <span className={cn(
                  "text-xs font-medium leading-none",
                  active && "font-semibold"
                )}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Create Button */}
      <button
        onClick={handleCreateGame}
        className="md:hidden fixed bottom-20 right-4 z-50 w-14 h-14 bg-[var(--brand-primary)] text-white rounded-full shadow-lg flex items-center justify-center touch-manipulation"
        aria-label="Create Game"
        data-testid="floating-create-button"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Desktop Top Navigation */}
      <div className="hidden md:block bg-[var(--bg-surface)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-[var(--text)]">
                Pickup Sports
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = isActive(tab.path);
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.path)}
                    data-testid={tab.testId}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px]",
                      active
                        ? "text-[var(--brand-primary)] bg-[var(--brand-primary)]/10"
                        : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-hover)]"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Desktop Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCreateGame}
                className="flex items-center space-x-2 px-4 py-2 bg-[var(--brand-primary)] text-white rounded-lg hover:bg-[var(--brand-primary)]/90 transition-colors min-h-[44px]"
                data-testid="desktop-create-button"
              >
                <Plus className="w-4 h-4" />
                <span>Create Game</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Pull-to-Refresh Indicator */}
      <div
        id="pull-to-refresh-indicator"
        className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[var(--brand-primary)] text-white text-center py-2 text-sm font-medium transform -translate-y-full transition-all duration-200"
        style={{ opacity: 0 }}
      >
        Pull to refresh
      </div>
    </>
  );
};

export default MobileNavigation;
