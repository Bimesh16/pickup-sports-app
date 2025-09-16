import React from 'react';
import { 
  User, 
  Activity,
  BarChart3,
  Award,
  Users,
  Gamepad2,
  Shield
} from 'lucide-react';
import { UserProfile } from './types';
import OverviewTab from './tabs/OverviewTab';
import ActivityTab from './tabs/ActivityTab';
import StatsTab from './tabs/StatsTab';
import BadgesTab from './tabs/BadgesTab';
import TeamsTab from './tabs/TeamsTab';
import SportsTab from './tabs/SportsTab';
import SecurityTab from './tabs/SecurityTab';

interface TabbedSectionsProps {
  profile: UserProfile;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAvailabilityUpdate: () => void;
}

const TabbedSections: React.FC<TabbedSectionsProps> = ({ profile, activeTab, onTabChange, onAvailabilityUpdate }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'badges', label: 'Badges', icon: Award },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'sports', label: 'Sports', icon: Gamepad2 },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex overflow-x-auto gap-1 pb-2">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-[var(--brand-primary)] text-white'
                  : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:bg-[var(--brand-primary)]/10'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && <OverviewTab profile={profile} />}
        {activeTab === 'activity' && <ActivityTab profile={profile} />}
        {activeTab === 'stats' && <StatsTab profile={profile} />}
        {activeTab === 'badges' && <BadgesTab profile={profile} />}
        {activeTab === 'teams' && <TeamsTab profile={profile} />}
        {activeTab === 'sports' && <SportsTab profile={profile} onAvailabilityUpdate={onAvailabilityUpdate} />}
        {activeTab === 'security' && <SecurityTab profile={profile} />}
      </div>
    </div>
  );
};

export default TabbedSections;
